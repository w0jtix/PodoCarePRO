import React from "react";
import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import AllProductService from "../../services/AllProductService";
import ActionButton from "../ActionButton";
import CategoryButtons from "../CategoryButtons";
import ListHeader, { ListModule } from "../ListHeader";
import TextInput from "../TextInput";
import BrandService from "../../services/BrandService";
import DropdownSelect from "../DropdownSelect";
import CategoryService from "../../services/CategoryService";
import { Alert, AlertType } from "../../models/alert";
import { useCallback } from "react";
import { ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES } from "../../constants/list-headers";
import { CategoryButtonMode, ProductCategory } from "../../models/categories";
import { NewProduct } from "../../models/product";
import { NewBrand, Brand, KeywordDTO } from "../../models/brand";
import { validateBrandForm, validateProductForm } from "../../utils/validators";
import { Action } from "../../models/action";
import {
  ProductWorkingData,
  OrderProductWorkingData,
  OrderWorkingData,
  createNewProductWorkingData,
} from "../../models/working-data";
import { useAlert } from "../Alert/AlertProvider";

export interface OrderNewProductsPopupProps {
  nonExistingProducts: OrderProductWorkingData[];
  orderWorkingData: OrderWorkingData;
  onClose: () => void;
  onFinalizeOrder: (orderWorkingData: OrderWorkingData) => void;
}

interface ProductWorkingDataWithOrderItems
  extends Omit<ProductWorkingData, "originalOrderProduct"> {
  relatedOrderProducts: OrderProductWorkingData[];
  originalOrderProduct?: OrderProductWorkingData["originalOrderProduct"];
}

export function OrderNewProductsPopup({
  nonExistingProducts,
  orderWorkingData,
  onClose,
  onFinalizeOrder,
}: OrderNewProductsPopupProps) {
  const { showAlert } = useAlert();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productItems, setProductItems] = useState<
    ProductWorkingDataWithOrderItems[]
  >([]);
  const [globalCategory, setGlobalCategory] = useState<ProductCategory | null>(
    null
  );
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    CategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        console.error("Error fetching categories:", error);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
    if (productItems.length === 0 && nonExistingProducts.length > 0) {
      const productNameMap = new Map<string, OrderProductWorkingData[]>();

      nonExistingProducts.forEach((orderProduct) => {
        const productName =
          orderProduct.productName ||
          (orderProduct.product && "name" in orderProduct.product
            ? orderProduct.product.name
            : "") ||
          "";

        if (!productNameMap.has(productName)) {
          productNameMap.set(productName, []);
        }
        productNameMap.get(productName)!.push(orderProduct);
      });

      const initItems: ProductWorkingDataWithOrderItems[] = Array.from(
        productNameMap.entries()
      ).map(([productName, relatedOrderProducts]) => {
        return {
          ...createNewProductWorkingData(productName),
          relatedOrderProducts,
          originalOrderProduct: relatedOrderProducts[0].originalOrderProduct,
        };
      });

      setProductItems(initItems);
    }
  }, [nonExistingProducts, productItems.length]);

  const handleSelectCategory = useCallback(
    (tempId: string, category: ProductCategory | null) => {
      setProductItems((prevItems) =>
        prevItems.map((item) =>
          item.tempId === tempId ? { ...item, category } : item
        )
      );
    },
    []
  );

  const handleGlobalCategoryChange = useCallback(
    (selected: ProductCategory[] | null) => {
      const category = selected && selected.length > 0 ? selected[0] : null;
      setProductItems((prevItems) =>
        prevItems.map((item) => ({ ...item, category }))
      );
      setGlobalCategory(category);
    },
    []
  );

  const handleGlobalCategoryReset = useCallback(() => {
    setProductItems((prevItems) =>
      prevItems.map((item) => ({ ...item, category: null }))
    );
    setGlobalCategory(null);
    setResetTriggered((prev) => !prev);
  }, []);

  const handleBrandChange = useCallback(
    (tempId: string, selected: string | Brand) => {
      let brand: Brand | NewBrand | null = null;

      if (typeof selected === "string") {
        if (selected.trim().length > 0) {
          brand = { name: selected.trim() };
        }
      } else {
        brand = selected;
      }

      setProductItems((prevItems) =>
        prevItems.map((item) =>
          item.tempId === tempId ? { ...item, brand } : item
        )
      );

      if (brand && brand.name && brand.name.trim().length > 0) {
        const filter: KeywordDTO = { keyword: brand.name };
        BrandService.getBrands(filter)
          .then((data) => {
            setProductItems((prevItems) =>
              prevItems.map((item) =>
                item.tempId === tempId
                  ? { ...item, brandSuggestions: data }
                  : item
              )
            );
          })
          .catch((error) => {
            console.error("Error fetching filtered brands:", error.message);
          });
      } else {
        setProductItems((prevItems) =>
          prevItems.map((item) =>
            item.tempId === tempId ? { ...item, brandSuggestions: [] } : item
          )
        );
      }
    },
    []
  );

  const createBrandsIfNeeded = async (
    items: ProductWorkingDataWithOrderItems[]
  ): Promise<Map<string, Brand>> => {
    const brandMap = new Map<string, Brand>();

    const newBrandNames = new Set<string>();

    items.forEach((item) => {
      if (item.brand && !("id" in item.brand) && item.brand.name) {
        newBrandNames.add(item.brand.name.trim());
      }
    });

    for (const brandName of newBrandNames) {
      const newBrand: NewBrand = { name: brandName };
      const error = validateBrandForm(newBrand, undefined, Action.CREATE);

      if (error) {
        showAlert(error, AlertType.ERROR);
        throw new Error(error);
      }
      try {
        const createdBrand = await BrandService.createBrand(newBrand);
        brandMap.set(brandName, createdBrand);
      } catch (error) {
        console.error("Error creating brand: ", error);
        showAlert("Błąd tworzenia marki.", AlertType.ERROR);
        throw error;
      }
    }
    return brandMap;
  };

  const createNewProducts = useCallback(async (): Promise<void> => {
    try {
      const brandMap = await createBrandsIfNeeded(productItems);

      const productsToCreate: NewProduct[] = productItems.map((item) => {
        let brand: Brand;

        if (item.brand && "id" in item.brand && item.brand.id) {
          brand = item.brand as Brand;
        } else if (item.brand && brandMap.has(item.brand.name)) {
          brand = brandMap.get(item.brand.name)!;
        } else {
          throw new Error(`Brand not found for product: ${item.name}`);
        }

        if (!item.category) {
          throw new Error(`Category not selected for product: ${item.name}`);
        }

        return {
          name: item.name,
          category: item.category,
          brand: brand,
          supply: item.supply || 0,
          description: item.description || "",
          isDeleted: false,
        };
      });

      for (const product of productsToCreate) {
        const error = validateProductForm(product, undefined, Action.CREATE);
        if (error) {
          showAlert(error, AlertType.ERROR);
          return;
        }
      }

      const createdProducts = await AllProductService.createNewProducts(
        productsToCreate
      );

      const updatedOrderProducts =
        orderWorkingData.orderProducts.map((orderProduct) => {
          const matchingItem = productItems.find((item) => {
            return item.relatedOrderProducts.some(
              (relatedOrderProduct) =>
                relatedOrderProduct.originalOrderProduct ===
                orderProduct.originalOrderProduct
            );
          });

          if (matchingItem) {
            const createdProduct = createdProducts.find(
              (product) =>
                product.name === matchingItem.name &&
                product.category.id === matchingItem.category?.id &&
                product.brand.name === (matchingItem.brand as Brand)?.name //name not id because matchingItem.brand is not yet updated if freshly created
            );

            if (createdProduct) {
              return {
                ...orderProduct,
                product: createdProduct,
                productName: createdProduct.name,
              };
            }
          }
          return orderProduct;
        }) || [];

      const finalOrderWorkingData = {
        ...orderWorkingData,
        orderProducts: updatedOrderProducts,
      };

      onFinalizeOrder(finalOrderWorkingData);
    } catch (error) {
      console.error("Error creating new products:", error);
      showAlert("Błąd tworzenia produktów.", AlertType.ERROR);
    }
  }, [productItems, orderWorkingData, onFinalizeOrder, showAlert]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className="add-popup-overlay flex justify-center align-items-start" onClick={onClose}>
      <div
        className="order-new-products-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="order-new-products-popup-header flex">
          <div className="order-new-products-popup-title-section flex-column align-items-center g-10px">
            <h2 className="popup-title">Nowe Produkty 👀</h2>
          </div>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="order-new-products-popup-action-keys-section flex justify-center align-items-center g-2 mt-2 mb-15">
          <a className="order-new-products-popup-action-keys-title text-align-center">
            Przypisz dla wszystkich:
          </a>
          <div className="order-new-products-popup-category-buttons flex g-15px justify-center align-items-center">
            <CategoryButtons
              categories={categories}
              onSelect={handleGlobalCategoryChange}
              mode={CategoryButtonMode.SELECT}
              resetTriggered={resetTriggered}
            />
            <ActionButton
              src={"src/assets/reset.svg"}
              alt={"Reset"}
              text={"Reset"}
              onClick={handleGlobalCategoryReset}
              disableText={true}
            />
          </div>
        </section>
        <ListHeader
          attributes={ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES}
          module={ListModule.POPUP}
        />
        <ul className="order-new-products-popup-list m-0 mb-2 p-0 width-max">
          {productItems.map((item) => (
            <li
              key={item.tempId}
              className="order-new-products-popup-list-item flex space-between align-items-center"
            >
              {item.name}
              <section className="order-new-products-popup-input-section flex g-5px">
                <TextInput
                  dropdown={true}
                  value={item.brand?.name || ""}
                  displayValue={"name"}
                  suggestions={item.brandSuggestions || []}
                  onSelect={(selected) =>
                    handleBrandChange(item.tempId, selected)
                  }
                />
                <DropdownSelect<ProductCategory>
                  items={categories}
                  placeholder="---------"
                  onChange={(selectedCategory) => {
                    const category = Array.isArray(selectedCategory)
                      ? selectedCategory[0] || null
                      : selectedCategory;
                    handleSelectCategory(item.tempId, category);
                  }}
                  value={item.category}
                  multiple={false}
                  searchable={false}
                  allowNew={false}
                  showTick={false}
                />
              </section>
            </li>
          ))}
        </ul>
        <div className="popup-footer-container flex-column justify-end">
          <ActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={createNewProducts}
          />
        </div>
      </div>
    </div>,
    portalRoot
  );
}

export default OrderNewProductsPopup;
