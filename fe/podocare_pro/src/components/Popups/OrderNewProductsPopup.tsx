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
import CostInput from "../CostInput";
import { AlertType } from "../../models/alert";
import { useCallback } from "react";
import { ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES, ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES_WITH_SELLING_PRICE } from "../../constants/list-headers";
import { CategoryButtonMode, ProductCategory } from "../../models/categories";
import { NewProduct } from "../../models/product";
import { NewBrand, Brand, KeywordDTO } from "../../models/brand";
import { validateBrandForm, validateProductForm } from "../../utils/validators";
import { Action } from "../../models/action";
import { NewOrder } from "../../models/order";
import { useAlert } from "../Alert/AlertProvider";
import SelectVATButton from "../SelectVATButton";
import { VatRate } from "../../models/vatrate";
import { NewOrderProduct } from "../../models/order-product";

export interface OrderNewProductsPopupProps {
  nonExistingProducts: NewOrderProduct[];
  orderDTO: NewOrder;
  onClose: () => void;
  onFinalizeOrder: (orderDTO: NewOrder) => void;
}

export function OrderNewProductsPopup({
  nonExistingProducts,
  orderDTO,
  onClose,
  onFinalizeOrder,
}: OrderNewProductsPopupProps) {
  const { showAlert } = useAlert();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productsToCreate, setProductsToCreate] = useState<NewProduct[]>([]);
  const [brandSuggestions, setBrandSuggestions] = useState<Map<number, Brand[]>>(new Map());
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    CategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching categories:", error);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
    if(nonExistingProducts.length > 0) {
      
      const uniqueProductsMap = new Map<string, NewProduct>();

      nonExistingProducts.forEach((op) => {
        if (!uniqueProductsMap.has(op.name)) {
          uniqueProductsMap.set(op.name, {
            name: op.name,
            category: null,
            brand: null,
            supply: 0,
            vatRate:null,
            sellingPrice: null,
          });
        }
      });

      const productsArray = Array.from(uniqueProductsMap.values());
      setProductsToCreate(productsArray);
    }
  }, [nonExistingProducts]);

  useEffect(() => {
    console.log(productsToCreate);
  },[productsToCreate])

  const handleSelectCategory = useCallback(
    (index: number, category: ProductCategory | null) => {
      setProductsToCreate((products) =>
        products.map((product, i) =>
          i === index ? { ...product, category, vatRate: category?.name === "Produkty" ? VatRate.VAT_23 : null } : product
        )
      );
    },[]);

  const handleSellingPrice = useCallback((index: number, cost: number) => {
    setProductsToCreate((products) =>
        products.map((product, i) =>
          i === index ? { ...product, sellingPrice: cost } : product
        )
      );
  },[])

  const handleVatRate = useCallback((index: number, selectedVat: VatRate) => {
    setProductsToCreate((products) =>
        products.map((product, i) =>
          i === index ? { ...product, vatRate: selectedVat } : product
        )
      );
  },[])

  const handleGlobalCategoryChange = useCallback(
    (selected: ProductCategory[] | null) => {
      const category = selected && selected.length > 0 ? selected[0] : null;
      setProductsToCreate((products) =>
        products.map((product) => ({...product, category, vatRate: category?.name === "Produkty" ? VatRate.VAT_23 : null  })));     
    }, []);

  const handleGlobalCategoryReset = useCallback(() => {
     setProductsToCreate((products) =>
        products.map((product) => ({...product, category: null }))); 
    setResetTriggered((prev) => !prev);
  }, []);

  const handleBrandChange = useCallback(
    async (index: number, selected: string | Brand) => {
      if (typeof selected === "string") {
        const filter: KeywordDTO = { keyword: selected };
        let suggestions: Brand[] = [];

        if (selected.trim().length > 0) {
          try {
            suggestions = await BrandService.getBrands(filter);
          } catch (error) {
            showAlert("Błąd", AlertType.ERROR);
            console.error("Error fetching filtered brands:", error);
          }
        }

        const exactMatch = suggestions.find(b => b.name === selected);

        setProductsToCreate((products) =>
          products.map((product, i) => {
            if (i === index) {
              if (exactMatch) {
                return {
                  ...product,
                  brand: exactMatch
                };
              } else {
                const shouldDetachBrand = product.brand !== null && 'id' in product.brand && product.brand.name !== selected;
                return {
                  ...product,
                  brand: shouldDetachBrand || selected.trim().length === 0 ? null : { name: selected.trim() }
                };
              }
            }
            return product;
          })
        );

        setBrandSuggestions((prev) => {
          const newMap = new Map(prev);
          newMap.set(index, exactMatch ? [] : suggestions);
          return newMap;
        });
      } else {
        setProductsToCreate((products) =>
          products.map((product, i) =>
            i === index ? { ...product, brand: selected } : product
          )
        );
        setBrandSuggestions((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(index, []);
          return newMap;
        });
      }
    },
    [showAlert]
  );

  const createBrandsIfNeeded = async (
    productsToCreate: NewProduct[]
  ): Promise<Map<string, Brand>> => {
    const brandMap = new Map<string, Brand>();

    const newBrandNames = new Set<string>();

    productsToCreate.forEach((item) => {
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
      const brandMap = await createBrandsIfNeeded(productsToCreate);

      const productsToValidate: NewProduct[] = productsToCreate.map((item) => {
        let brand: Brand;

        if (item.brand && "id" in item.brand && item.brand.id) {
          brand = item.brand as Brand;
        } else if (item.brand && brandMap.has(item.brand.name)) {
          brand = brandMap.get(item.brand.name)!;
        } else {
          throw new Error(`Brand not found for product: ${item.name}`);
        }

        return {
          name: item.name,
          category: item.category,
          brand: brand,
          supply: item.supply || 0,
          sellingPrice: item.sellingPrice,
        };
      });

      for (const product of productsToValidate) {
        const error = validateProductForm(product, undefined, Action.CREATE);
        if (error) {
          showAlert(error, AlertType.ERROR);
          return;
        }
      }

      const createdProducts = await AllProductService.createNewProducts(
        productsToValidate
      );

      const updatedOrderProducts = orderDTO.orderProducts?.map((orderProduct) => {
        const createdProduct = createdProducts.find(
          (product) => product.name === orderProduct.name
        );

        if (createdProduct) {
          return {
            ...orderProduct,
            product: createdProduct,
          };
        }
        return orderProduct;
      });

      const finalOrderDTO = {
        ...orderDTO,
        orderProducts: updatedOrderProducts,
      };

      onFinalizeOrder(finalOrderDTO);
    } catch (error) {
      console.error("Error creating new products:", error);
      showAlert("Błąd tworzenia produktów.", AlertType.ERROR);
    }
  }, [productsToCreate, orderDTO, onFinalizeOrder, showAlert]);

  const hasProductCategory = productsToCreate.some((item) => item.category?.name === "Produkty")
  

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
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
              iconTitle={"Resetuj"}
              text={"Reset"}
              onClick={handleGlobalCategoryReset}
              disableText={true}
            />
          </div>
        </section>
        <ListHeader
          attributes={hasProductCategory ? ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES_WITH_SELLING_PRICE : ORDER_NEW_PRODUCTS_POPUP_ATTRIBUTES}
          module={ListModule.POPUP}
        />
        <ul className="order-new-products-popup-list m-0 mb-2 p-0 width-max">
          {productsToCreate.map((item, index) => (
            <li
              key={`product-${index}-${item.name}`}
              className="order-new-products-popup-list-item flex space-between align-items-center"
            >
              {item.name}
              <section className="order-new-products-popup-input-section flex g-5px">
                {item.category && item.category.name === "Produkty" && (
                  <>
                  <CostInput onChange={(cost) => handleSellingPrice(index, cost)} selectedCost={item.sellingPrice ?? 0} />
                    <SelectVATButton
                      selectedVat={item.vatRate ?? VatRate.VAT_23}
                      onSelect={(vatRate) => handleVatRate(index, vatRate)}
                      className="product-form"
                    />
                  </>
                )}
                <TextInput
                  dropdown={true}
                  value={item.brand?.name || ""}
                  displayValue={"name"}
                  suggestions={brandSuggestions.get(index) || []}
                  onSelect={(selected) =>
                    handleBrandChange(index, selected)
                  }
                />
                <DropdownSelect<ProductCategory>
                  items={categories}
                  placeholder="---------"
                  onChange={(selectedCategory) => {
                    const category = Array.isArray(selectedCategory)
                      ? selectedCategory[0] || null
                      : selectedCategory;
                    handleSelectCategory(index, category);
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
