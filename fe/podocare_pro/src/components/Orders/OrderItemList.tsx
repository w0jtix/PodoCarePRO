import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import SelectVATButton from "../SelectVATButton";
import AllProductService from "../../services/AllProductService";
import ActionButton from "../ActionButton";
import CostInput from "../CostInput";
import DigitInput from "../DigitInput";
import TextInput from "../TextInput";
import { ListAttribute } from "../../constants/list-headers";
import { Action } from "../../models/action";
import { Product, ProductFilterDTO } from "../../models/product";
import { VatRate } from "../../models/vatrate";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { NewOrderProduct } from "../../models/order-product";

export interface OrderItemListProps {
  attributes: ListAttribute[];
  action: Action;
  onConflictDetected?: (productName: string, add: boolean) => void;
  className?: string;
  orderProducts: NewOrderProduct[];
  setOrderProducts: React.Dispatch<React.SetStateAction<NewOrderProduct[]>>;
}


export function OrderItemList({
  attributes,
  action,
  onConflictDetected,
  className = "",
  orderProducts,
  setOrderProducts,

}: OrderItemListProps) {
  const { showAlert } = useAlert();
  const [productSuggestions, setProductSuggestions] = useState<Map<number, Product[]>>(new Map());
  const [supplyPreview, setSupplyPreview] = useState<Map<number, number>>(new Map()); // productId -> supply after edits
  const initialSupplyRef = useRef<Map<number, number>>(new Map()); // initial warehouse supply snapshot
  const initialOrderProductsRef = useRef<NewOrderProduct[]>([]); // initial order products qty snapshot
  const [productWarnings, setProductWarnings] = useState<Map<number, boolean>>(new Map());


  const updateWarnings = useCallback(() => {
    if (action !== Action.EDIT) return;

    const newWarnings = new Map<number, boolean>();
    let hasAnyWarning = false;

    orderProducts.forEach(op => {
      if (op.product?.id) {
        const preview = supplyPreview.get(op.product.id);
        if (preview !== undefined && preview < 0) {
          newWarnings.set(op.product.id, true);
          hasAnyWarning = true;
        }
      }
    });
    
    setProductWarnings(newWarnings);
  }, [action, orderProducts, supplyPreview]);

  useEffect(() => {
    if(action === Action.EDIT && orderProducts.length > 0 && supplyPreview.size === 0){
      const fetchSupplyPreview = async () => {
      const productIds = Array.from(
        new Set(
          orderProducts
            .map(op => op.product?.id)
            .filter((id): id is number => typeof id === "number")
        )
      );

      if (productIds.length === 0) return;

      try {
        const filter: ProductFilterDTO = { productIds, includeZero: true };
        const products = await AllProductService.getProducts(filter);

        const initialMap = new Map<number, number>();
        const previewMap = new Map<number, number>();

        products.content.forEach(product => {
          initialMap.set(product.id, product.supply);
          previewMap.set(product.id, product.supply);
        });

        initialSupplyRef.current = initialMap;
        initialOrderProductsRef.current = JSON.parse(JSON.stringify(orderProducts));
        setSupplyPreview(previewMap);
      } catch (error) {
        console.error("Error fetching supply preview:", error);
        showAlert("Błąd", AlertType.ERROR);
      }
    };

    fetchSupplyPreview();
  }
  }, [action, orderProducts, supplyPreview.size, showAlert]);

  useEffect(() => {
    if (action === Action.EDIT && supplyPreview.size > 0) {
      updateWarnings();
    }
  }, [supplyPreview, action, updateWarnings]);

  const handleOrderProductRemove = useCallback((index: number) => {
    setOrderProducts((prev) => prev.filter((_, i) => i !== index));

    setProductSuggestions((prev) => {
      const newMap = new Map<number, Product[]>();
      prev.forEach((value, key) => {
        if (key < index) {
          newMap.set(key, value);
        } else if (key > index) {
          newMap.set(key - 1, value);
        }
      });
      return newMap;
    });
  },[]);

  const handleOrderProductNameChange = useCallback(async (index: number, selected: string | Product) => {

    if (typeof selected === 'string') {
      const filter: ProductFilterDTO = { keyword: selected, includeZero: true };
      let suggestions: Product[] = [];

      if (selected.trim().length > 0) {
        try {
          const response = await AllProductService.getProducts(filter);
          suggestions = response.content;
        } catch (error) {
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error fetching filtered products:", error);
        }
      }

      const exactMatch = suggestions.find(p => p.name === selected);

      setOrderProducts((prev) =>
        prev.map((op, i) => {
          if (i === index) {
            if (exactMatch) {
              return {
                ...op,
                name: selected,
                product: exactMatch
              };
            } else {
              const shouldDetachProduct = op.product !== null && op.product.name !== selected;
              return {
                ...op,
                name: selected,
                product: shouldDetachProduct ? null : op.product
              };
            }
          }
          return op;
        })
      );

      setProductSuggestions((prev) => {
        const newMap = new Map(prev);
        newMap.set(index, exactMatch ? [] : suggestions);
        return newMap;
      });
    } else {
      setOrderProducts((prev) =>
        prev.map((op, i) => i === index ? { ...op, product: selected, name: selected.name } : op)
      );
      setProductSuggestions((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(index, []);
        return newMap;
      });
    }
  },[showAlert])

  const handleInputChange = useCallback(
    (index: number, field: keyof NewOrderProduct, value: number) => {
      setOrderProducts((prev) =>
        prev.map((op, i) => i === index ? { ...op, [field]: value } : op))
  }, []);
  const handleVatSelect = useCallback(
    (index: number, selectedVAT: VatRate) => {
      setOrderProducts((prev) =>
      prev.map((op, i) => i === index ? { ...op, vatRate: selectedVAT } : op)
    )
  },[]);

  const calculateTotalPrice = (price: number, quantity: number): string => {
    const total = price * quantity;
    return isNaN(total) ? "0.00" : total.toFixed(2);
  };

  useEffect(() => {
    if (action !== Action.EDIT || initialSupplyRef.current.size === 0) return;

    const newPreview = new Map(initialSupplyRef.current);

    const originalQuantities = new Map<number, number>();
    initialOrderProductsRef.current.forEach(op => {
      if (op.product?.id) {
        const current = originalQuantities.get(op.product.id) ?? 0;
        originalQuantities.set(op.product.id, current + op.quantity);
      }
    });

    const currentQuantities = new Map<number, number>();
    orderProducts.forEach(op => {
      if (op.product?.id) {
        const current = currentQuantities.get(op.product.id) ?? 0;
        currentQuantities.set(op.product.id, current + op.quantity);
      }
    });

    newPreview.forEach((initialSupply, productId) => {
      const original = originalQuantities.get(productId) ?? 0;
      const current = currentQuantities.get(productId) ?? 0;
      const diff = current - original; 

      newPreview.set(productId, initialSupply + diff);
    });

    setSupplyPreview(newPreview);
  }, [action, orderProducts]);

  const prevSupplyPreviewRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    if (action !== Action.EDIT || !onConflictDetected) return;

    supplyPreview.forEach((currentValue, productId) => {
      let product = orderProducts.find(op => op.product?.id === productId)?.product;
      if (!product) {
        product = initialOrderProductsRef.current.find(op => op.product?.id === productId)?.product;
      }
      if (!product) return;

      const previousValue = prevSupplyPreviewRef.current.get(productId);

      if (previousValue !== undefined) {
        const wasNegative = previousValue < 0;
        const isNowNegative = currentValue < 0;

        if (!wasNegative && isNowNegative) {
          onConflictDetected(product.name, true);
        } else if (wasNegative && !isNowNegative) {
          onConflictDetected(product.name, false);
        }
      }
    });

    prevSupplyPreviewRef.current = new Map(supplyPreview);
  }, [supplyPreview, action, onConflictDetected, orderProducts]);


  const renderAttributeContent = (
    attr: ListAttribute,
    item: NewOrderProduct,
    index: number
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <ActionButton
            src="src/assets/cancel.svg"
            alt="Usuń Produkt"
            iconTitle={"Usuń Produkt"}
            text="Usuń"
            onClick={() => handleOrderProductRemove(index)}
            disableText={true}
          />
        );

      case "Nazwa":
        return (
          <div className="order-item-list-product-name-with-warning flex align-items-center g-2px">
            <TextInput
              key={`text-input-${item.product?.id || 'new'}-${index}`}
              dropdown={true}
              value={item.name}
              suggestions={productSuggestions.get(index) || []}
              onSelect={(selected) => {
                handleOrderProductNameChange(index, selected);
              }}
            />
            {item.product?.id && productWarnings.get(item.product.id) && (
              <img
                src="src/assets/warning.svg"
                alt="Warning"
                className="order-item-warning-icon"
              />
            )}
          </div>
        );

      case "Marka":
        return (item.product ? (
          <span className="order-brand-span flex text-align-center italic">{item.product.brand.name}</span>
        ) : null)

      case "Cena jedn.":
        return (
          <CostInput
            key={`cost-input-${item.product?.id || 'new'}-${index}`}
            selectedCost={item.price}
            onChange={(value) =>
              handleInputChange(
                index,
                "price",
                parseFloat(value.toString()) || 0
              )
            }
            placeholder={"0.00"}
          />
        );

      case "Ilość":
        return (
          <DigitInput
            key={`digit-input-${item.product?.id || 'new'}-${index}`}
            placeholder="1"
            value={item.quantity}
            onChange={(value) =>
              handleInputChange(
                index,
                "quantity",
                parseInt(value ? value.toString() : "0") || 0
              )
            }
          />
        );

      case "VAT":
        return (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: attr.justify,
            }}
          >
            <SelectVATButton
              key={`vat-button-${item.product?.id || 'new'}-${index}`}
              selectedVat={item.vatRate}
              onSelect={(selectedVAT) =>
                handleVatSelect(index, selectedVAT)
              }
            />
          </div>
        );

      case "Cena":
        return (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: attr.justify,
            }}
          >
            <span>{calculateTotalPrice(item.price, item.quantity)} zł</span>
          </div>
        );

      default:
        return (null);
    }
  };

  return (
    <div className={`order-item-list ${className}`}>
      {orderProducts.map((item, index) => (
        <div key={`order-item-${item.product?.id || 'new'}-${index}`} className="order-item flex">
          {attributes.map((attr) => (
            <div
              key={`${index}-${attr.name}`}
              className={`order-attribute-item ${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyItems: attr.justify,
              }}
            >
              {renderAttributeContent(attr, item, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default OrderItemList;
