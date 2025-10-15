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
import {
  ProductWorkingData,
  OrderProductWorkingData,
  createNewProductWorkingData,
} from "../../models/working-data";

export interface OrderItemListProps {
  attributes: ListAttribute[];
  orderProducts: OrderProductWorkingData[];
  onOrderProductsChange: (orderProducts: OrderProductWorkingData[]) => void;
  action: Action;
  setHasWarning?: (hasWarning: boolean) => void;
  className?: string;
}

interface SupplyInfo {
  [productId: number]: {
    originalSupply: number;
    currentSupply: number;
    isDeleted: boolean;
  };
}

export function OrderItemList({
  attributes,
  orderProducts,
  onOrderProductsChange,
  action,
  setHasWarning,
  className = "",
}: OrderItemListProps) {
  const [supplyInfo, setSupplyInfo] = useState<SupplyInfo>({});

  const initialOrderProductsRef = useRef<OrderProductWorkingData[]>([]);
  const orderProductsRef = useRef(orderProducts);
  orderProductsRef.current = orderProducts;

  useEffect(() => {
    if (
      action === Action.EDIT &&
      initialOrderProductsRef.current.length === 0
    ) {
      initialOrderProductsRef.current = JSON.parse(
        JSON.stringify(orderProducts)
      );
    }
  }, []);

  const isProduct = (
    product: Product | ProductWorkingData
  ): product is Product => {
    return "id" in product && typeof product.id === "number";
  };

  const isProductWorkingData = (
    product: Product | ProductWorkingData
  ): product is ProductWorkingData => {
    return "tempId" in product && typeof product.tempId === "string";
  };

  const getProductId = (item: OrderProductWorkingData): number | undefined => {
    if (!item.product) return undefined;
    if (isProduct(item.product)) {
      return item.product.id;
    }
    return undefined;
  };

  const isNewOrderProduct = (item: OrderProductWorkingData): boolean => {
    return item.originalOrderProduct === null;
  };

  const isNewProduct = (item: OrderProductWorkingData): boolean => {
    if (!item.product) return true;
    return isProductWorkingData(item.product);
  };

  useEffect(() => {
    if (action === Action.EDIT && orderProducts.length > 0) {
      initializeSupplyInfo();
    }
  }, []);

  useEffect(() => {
    if (action === Action.EDIT && Object.keys(supplyInfo).length > 0) {
      updateAllWarnings();
    }
  }, [supplyInfo, action]);

  const initializeSupplyInfo = async (): Promise<void> => {
    const productIds = Array.from(
      new Set(
        orderProducts
          .map(getProductId)
          .filter((id): id is number => typeof id === "number")
      )
    );

    if (productIds.length === 0) return;

    const filter: ProductFilterDTO = {
      productIds: productIds.length === 0 ? null : productIds,
      includeZero: true,
    };

    try {
      const data = await AllProductService.getProducts(filter);
      const newSupplyInfo: SupplyInfo = {};

      data.forEach((product) => {
        const originalSupply = product.supply || 0;

        newSupplyInfo[product.id] = {
          originalSupply,
          currentSupply: originalSupply,
          isDeleted: product.isDeleted || false,
        };
      });
      setSupplyInfo(newSupplyInfo);
    } catch (error) {
      console.error("Error fetching product supply:", error);
    }
  };

  const updateSupplyForProduct = useCallback(
    (productId: number, quantityChange: number) => {
      setSupplyInfo((prev) => {
        if (!prev[productId]) return prev;

        const updated = {
          ...prev,
          [productId]: {
            ...prev[productId],
            currentSupply: prev[productId].currentSupply - quantityChange,
          },
        };
        return updated;
      });
    },
    []
  );

  const updateAllWarnings = useCallback(() => {
    if (action !== Action.EDIT) return;

    let hasAnyWarning = false;

    const updatedProducts = orderProductsRef.current.map((item) => {
      let hasWarning = false;

      if (isNewProduct(item) || isNewOrderProduct(item)) {
        return { ...item, hasWarning: false };
      }

      const productId = getProductId(item);
      if (productId && supplyInfo[productId]) {
        const supply = supplyInfo[productId];

        if (!supply.isDeleted) {
          if (supply.currentSupply < 0) {
            hasWarning = true;
            hasAnyWarning = true;
          }
        }
      }

      Object.values(supplyInfo).forEach((supply) => {
        if (!supply.isDeleted && supply.currentSupply < 0) {
          hasAnyWarning = true;
        }
      });

      return { ...item, hasWarning };
    });

    if (
      JSON.stringify(updatedProducts) !==
      JSON.stringify(orderProductsRef.current)
    ) {
      onOrderProductsChange(updatedProducts);
    }
    setHasWarning?.(hasAnyWarning);
  }, [action, supplyInfo, onOrderProductsChange, setHasWarning]);

  const updateOrderProduct = useCallback(
    (tempId: string, updates: Partial<OrderProductWorkingData>) => {
      const currentItem = orderProductsRef.current.find(
        (item) => item.tempId === tempId
      );

      if (
        currentItem &&
        "quantity" in updates &&
        !isNewProduct(currentItem) &&
        !isNewOrderProduct(currentItem)
      ) {
        const productId = getProductId(currentItem);
        if (productId) {
          const oldQuantity = currentItem.quantity;
          const newQuantity = updates.quantity as number;
          const quantityChange = oldQuantity - newQuantity;

          updateSupplyForProduct(productId, quantityChange);
        }
      }

      const updatedProducts = orderProductsRef.current.map((item) =>
        item.tempId === tempId ? { ...item, ...updates } : item
      );

      onOrderProductsChange(updatedProducts);
    },
    [updateSupplyForProduct, onOrderProductsChange]
  );

  const fetchProductSuggestions = useCallback(
    async (tempId: string, keyword: string) => {
      if (keyword.trim().length === 0) {
        updateOrderProduct(tempId, {
          productSuggestions: [],
        });
        return;
      }
      const filter: ProductFilterDTO = { keyword: keyword, includeZero: true };

      AllProductService.getProducts(filter)
        .then((data) => {
          updateOrderProduct(tempId, {
            productSuggestions: data,
          });
        })
        .catch((error) => {
          console.error("Error fetching filtered products:", error.message);
        });
    },
    [updateOrderProduct]
  );

  const handleItemRemove = useCallback(
    (tempId: string) => {
      const itemToRemove = orderProducts.find((item) => item.tempId === tempId);

      if (
        itemToRemove &&
        !isNewProduct(itemToRemove) &&
        !isNewOrderProduct(itemToRemove)
      ) {
        const productId = getProductId(itemToRemove);
        if (productId) {
          updateSupplyForProduct(productId, itemToRemove.quantity);
        }
      }

      const updatedProducts = orderProducts.filter(
        (item) => item.tempId !== tempId
      );
      onOrderProductsChange(updatedProducts);
    },
    [orderProducts, updateSupplyForProduct, onOrderProductsChange]
  );

  const handleProductNameChange = useCallback(
    async (tempId: string, selection: string | Product) => {
      const currentItem = orderProductsRef.current.find(
        (item) => item.tempId === tempId
      );

      if (
        currentItem &&
        !isNewProduct(currentItem) &&
        !isNewOrderProduct(currentItem)
      ) {
        const oldProductId = getProductId(currentItem);
        const newProductId =
          typeof selection === "string" ? null : selection.id;

        if (oldProductId && oldProductId !== newProductId) {
          updateSupplyForProduct(oldProductId, currentItem.quantity);
        }

        if (newProductId && oldProductId !== newProductId) {
          updateSupplyForProduct(newProductId, currentItem.quantity);
        }
      }

      if (typeof selection === "string") {
        const productWorkingData = createNewProductWorkingData(selection);
        updateOrderProduct(tempId, {
          productName: selection,
          product: productWorkingData,
        });
        fetchProductSuggestions(tempId, selection);
      } else {
        updateOrderProduct(tempId, {
          productName: selection.name,
          product: selection,
          productSuggestions: [],
        });
      }
    },
    [
      orderProducts,
      updateSupplyForProduct,
      updateOrderProduct,
      fetchProductSuggestions,
    ]
  );

  const handleInputChange = useCallback(
    (tempId: string, field: keyof OrderProductWorkingData, value: number) => {
      updateOrderProduct(tempId, { [field]: value });
    },
    [updateOrderProduct]
  );

  const handleVatSelect = useCallback(
    (tempId: string, selectedVAT: VatRate) => {
      updateOrderProduct(tempId, { vatRate: selectedVAT });
    },
    [updateOrderProduct]
  );

  const calculateTotalPrice = (price: number, quantity: number): string => {
    const total = price * quantity;
    return isNaN(total) ? "0.00" : total.toFixed(2);
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    item: OrderProductWorkingData
  ): React.ReactNode => {
    switch (attr.name) {
      case "":
        return (
          <ActionButton
            src="src/assets/cancel.svg"
            alt="Usuń Produkt"
            text="Usuń"
            onClick={() => handleItemRemove(item.tempId)}
            disableText={true}
          />
        );

      case "Nazwa":
        return (
          <div className="order-item-list-product-name-with-warning flex align-items-center g-2px">
            <TextInput
              dropdown={true}
              value={item.productName}
              suggestions={item.productSuggestions || []}
              onSelect={(selected) => {
                handleProductNameChange(item.tempId, selected);
              }}
            />
            {item.hasWarning && (
              <img
                src="src/assets/warning.svg"
                alt="Warning"
                className="order-item-warning-icon"
              />
            )}
          </div>
        );

      case "Cena jedn.":
        return (
          <CostInput
            selectedCost={item.price}
            onChange={(value) =>
              handleInputChange(
                item.tempId,
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
            placeholder="1"
            value={item.quantity}
            onChange={(value) =>
              handleInputChange(
                item.tempId,
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
              selectedVat={item.vatRate}
              onSelect={(selectedVAT) =>
                handleVatSelect(item.tempId, selectedVAT)
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
        <div key={`order-item-${item.tempId}`} className="order-item flex">
          {attributes.map((attr) => (
            <div
              key={`${item.tempId}-${attr.name}`}
              className={`order-attribute-item ${
                attr.name === "" ? "order-category-column" : ""
              }`}
              style={{
                width: attr.width,
                justifyItems: attr.justify,
              }}
            >
              {renderAttributeContent(attr, item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default OrderItemList;
