import { Employee } from "../../models/employee";
import { UsageRecordItem, UsageReason } from "../../models/usage-record";
import { useCallback, useEffect, useState } from "react";
import EmployeeService from "../../services/EmployeeService";
import DropdownSelect from "../DropdownSelect";
import { Product } from "../../models/product";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import DateInput from "../DateInput";
import SearchBar from "../SearchBar";
import ItemList from "./ItemList";
import { ProductFilterDTO } from "../../models/product";
import AllProductService from "../../services/AllProductService";
import { Action } from "../../models/action";
import { PRODUCT_SELECT_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { ProductCategory, CategoryButtonMode } from "../../models/categories";
import CategoryService from "../../services/CategoryService";
import CategoryButtons from "../CategoryButtons";
import ActionButton from "../ActionButton";
import DigitInput from "../DigitInput";
import { InventoryReport, NewInventoryReportItem, InventoryReportItem } from "../../models/inventory_report";
import CostInput from "../CostInput";
import { getSupplyChange } from "../../utils/inventoryReportUtils";

export interface InventoryReportFormProps {
  inventoryReportItems: InventoryReportItem[] | NewInventoryReportItem[];
  setInventoryReportItems: React.Dispatch<React.SetStateAction<InventoryReportItem[] | NewInventoryReportItem[]>>;
  className?: string;
}

export function InventoryReportForm({
  inventoryReportItems,
  setInventoryReportItems,
  className = "",
}: InventoryReportFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);
  const [productFilter, setProductFilter] = useState<ProductFilterDTO>({
    categoryIds: null,
    keyword: "",
    includeZero: true,
    isDeleted: false,
  });
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  const fetchProducts = async (pageNum: number = 0, append: boolean = false): Promise<void> => {
    AllProductService.getProducts(productFilter, pageNum, 30)
      .then((data) => {
        const content = data?.content || [];
        if (append) {
          setProducts((prev) => [...prev, ...content]);
        } else {
          setProducts(content);
        }

        setHasMore(!data.last);
        setPage(pageNum);
        setLoading(false);
      })
      .catch((error) => {
        if (!append) setProducts([]);
        setLoading(false);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching products:", error);
      });
  };
  const fetchCategories = async (): Promise<void> => {
    CategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching categories:", error);
      });
  };

  /* CORE */



  /* ITEM SELECT LIST */
  const handleProductKeywordChange = useCallback((newKeyword: string) => {
    setProductFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);
  const handleSelectProducts = useCallback(
    (product: Product) => {
      const exists = inventoryReportItems.some(
        (item) => item.product.id === product.id
      );

      if (exists) {
        showAlert("Produkt już jest na liście", AlertType.ERROR);
        return;
      }

      const newItem: NewInventoryReportItem = {
        product: product,
        supplyBefore: product.supply,
        supplyAfter: product.supply,
      };

      setInventoryReportItems((prev) => [...prev, newItem]);
    },
    [inventoryReportItems, showAlert, setInventoryReportItems]
  );
  const handleCategoryChange = useCallback(
    (categories: ProductCategory[] | null) => {
      categories
        ? setSelectedCategories(categories)
        : setSelectedCategories([]);
    },
    []
  );
  useEffect(() => {
    setProductFilter((prev) => ({
      ...prev,
      categoryIds:
        selectedCategories.length > 0
          ? selectedCategories.map((cat) => cat.id)
          : null,
    }));
  }, [selectedCategories]);

  /* SELECTED PRODUCTS LIST */
  const handleRemoveProduct = useCallback(
    (productId: number) => {
      setInventoryReportItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    },
    [inventoryReportItems]
  );

  const handleSupplyAfterChange = useCallback(
    async (productId: number, supplyAfter: number | null) => {
      setInventoryReportItems((prev) =>
        prev.map((item) =>
          item.product.id === productId
            ? { ...item, supplyAfter: supplyAfter ?? 0 }
            : item
        )
      );
    },
    [setInventoryReportItems, showAlert]
  );



  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list

      if (scrolledToBottom && hasMore && !loading) {
        fetchProducts(page + 1, true);
      }
    },
    [hasMore, loading, page, productFilter]
  );

  useEffect(() => {
    fetchProducts(0, false);
    setPage(0);
    setHasMore(true);
  }, [productFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="form-container flex-column f-1 min-height-0 align-self-center width-90">
      <div className="width-max flex space-between min-height-0">
        <div className="flex-column width-60 align-items-center ">
          
          <div className="selected-usage-product-list report flex-column f-1 width-max align-items-center g-1">
            {inventoryReportItems.map((item) => (
              <div
                key={item.product.id}
                className="usage-product-item flex-column align-items-center width-97 space-between"
              >
                <div className={`usage-item-row flex width-max justify-center ${getSupplyChange(item).className}`}>
                  <div className="usage-item-row-interior width-95 flex align-items-center space-between">
                    <div className="usage-item-span-group flex g-1 align-items-center">
                  <div
                    className="category-container usage-record p-0"
                    style={{
                      backgroundColor: item.product.category?.color
                        ? `rgb(${item.product.category.color})`
                        : undefined,
                    }}
                  />
                  <span className="usage-product-name">
                    {item.product.name}
                  </span>
                  <span className="usage-product-brand">
                    {item.product.brand.name}
                  </span>
                  </div>
                  <ActionButton
                    src="src/assets/cancel.svg"
                    alt="Usuń Produkt"
                    iconTitle={"Usuń Produkt"}
                    text="Usuń"
                    onClick={() => handleRemoveProduct(item.product.id)}
                    disableText={true}
                    className="usage-record"
                  />
                </div>
                </div>
                <div className="usage-item-row flex align-items-center width-max space-evenly mb-05 mt-05">
                  <div className="popup-common-section-row flex align-items-center space-between g-10px name">
                    <a className="product-form-input-title">Było:</a>
                    <DigitInput
                      value={item.supplyBefore}
                      onChange={() => undefined}
                      min={1}                      
                      max={999}
                      placeholder=""
                      disabled={true}
                    />
                  </div>
                  <div className="popup-common-section-row flex align-items-center space-between g-10px name">
                    <a className="product-form-input-title">Jest:</a>
                    <DigitInput
                      value={item.supplyAfter ?? item.supplyBefore}
                      onChange={(value) =>
                        handleSupplyAfterChange(item.product.id, value)
                      }
                      min={0}
                      max={999}
                    />
                  </div>
                  <div className="popup-common-section-row flex align-items-center space-between g-10px name">
                    <a className="product-form-input-title">Zmiana:</a>
                    <span className={`report-supply-change ${getSupplyChange(item).className}`}>{getSupplyChange(item).label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`list-container width-30 flex-column min-height-0 report`}>
          <div className="filters-container flex-column g-1 width-max align-items-center justify-center usage">
            <h2 className="list-container-header">Wybierz z listy:</h2>
            <SearchBar
              onKeywordChange={handleProductKeywordChange}
              resetTriggered={false}
              placeholder="Szukaj produktu..."
              className="pricelist"
            />
            <CategoryButtons
              categories={categories}
              selectedCategories={selectedCategories}
              onSelect={handleCategoryChange}
              mode={CategoryButtonMode.MULTISELECT}
            />
          </div>

          <ItemList
            attributes={PRODUCT_SELECT_LIST_ATTRIBUTES}
            items={products}
            action={Action.DISPLAY}
            onClick={(prod) => handleSelectProducts(prod)}
            className="products pricelist popup inv-report"
            onScroll={handleScroll}
            isLoading={loading}
            hasMore={hasMore}
          />
        </div>
      </div>
    </div>
  );
}
export default InventoryReportForm;
