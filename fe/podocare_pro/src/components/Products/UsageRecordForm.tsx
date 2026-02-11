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

export interface UsageRecordFormProps {
  usageRecordItems: UsageRecordItem[];
  setUsageRecordItems: React.Dispatch<React.SetStateAction<UsageRecordItem[]>>;
  sharedFields: { employee: Employee | null; usageDate: string };
  setSharedFields: React.Dispatch<
    React.SetStateAction<{ employee: Employee | null; usageDate: string }>
  >;
  hasSupplyError: boolean;
  setHasSupplyError: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}

export function UsageRecordForm({
  usageRecordItems,
  setUsageRecordItems,
  sharedFields,
  setSharedFields,
  hasSupplyError,
  setHasSupplyError,
  className = "",
}: UsageRecordFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);
  const [productFilter, setProductFilter] = useState<ProductFilterDTO>({
    categoryIds: null,
    keyword: "",
  });
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const { showAlert } = useAlert();

  const usageReasonItems = [
    { id: UsageReason.REGULAR_USAGE, name: "Regularne zużycie" },
    { id: UsageReason.OUT_OF_DATE, name: "Przeterminowane" },
  ];

  const fetchEmployees = async () => {
    EmployeeService.getAllEmployees()
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        console.error("Error fetching Employees: ", error);
        showAlert("Błąd", AlertType.ERROR);
        setEmployees([]);
      });
  };
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
  const handleEmployeeChange = useCallback(
    (employee: Employee | Employee[] | null) => {
      const selectedEmployee = Array.isArray(employee) ? employee[0] : employee;
      setSharedFields((prev) => ({
        ...prev,
        employee: selectedEmployee,
      }));
    },
    [setSharedFields]
  );
  const handleUsageDateChange = useCallback(
    (newDate: string | null) => {
      setSharedFields((prev) => ({
        ...prev,
        usageDate: newDate || new Date().toISOString().split("T")[0],
      }));
    },
    [setSharedFields]
  );

  /* ITEM SELECT LIST */
  const handleProductKeywordChange = useCallback((newKeyword: string) => {
    setProductFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);
  const handleSelectProducts = useCallback(
    (product: Product) => {
      const exists = usageRecordItems.some(
        (item) => item.product.id === product.id
      );

      if (exists) {
        showAlert("Produkt już jest na liście", AlertType.ERROR);
        return;
      }

      const newItem: UsageRecordItem = {
        product: product,
        quantity: 1,
        usageReason: UsageReason.REGULAR_USAGE,
      };

      setUsageRecordItems((prev) => [...prev, newItem]);
    },
    [usageRecordItems, showAlert, setUsageRecordItems]
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
      setUsageRecordItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      setHasSupplyError(false);
    },
    [setUsageRecordItems, setHasSupplyError]
  );

  const handleQuantityChange = useCallback(
    async (productId: number, quantity: number | null) => {
      setUsageRecordItems((prev) =>
        prev.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: quantity ?? 0 }
            : item
        )
      );

      if (quantity && quantity > 0) {
        try {
          const currentProduct = await AllProductService.getProductById(productId);
          if (quantity > currentProduct.supply) {
            setHasSupplyError(true);
            showAlert(
              `Przekroczono dostępny stan magazynowy dla ${currentProduct.name}. Dostępne: ${currentProduct.supply}`,
              AlertType.ERROR
            );
          }
        } catch (error) {
          console.error("Error checking product supply:", error);
        }
      }
    },
    [setUsageRecordItems, showAlert, setHasSupplyError]
  );

  const handleUsageReasonChange = useCallback(
    (productId: number, reason: UsageReason) => {
      setUsageRecordItems((prev) =>
        prev.map((item) =>
          item.product.id === productId
            ? { ...item, usageReason: reason }
            : item
        )
      );
    },
    [setUsageRecordItems]
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
    fetchEmployees();
    fetchCategories();
  }, []);

  return (
    <div className="form-container align-self-center width-90">
      <div className="width-max flex space-between">
        <div className="flex-column width-half align-items-center">
          <div className="flex space-between width-max align-items-center">
            <div className="popup-common-section-row flex align-items-center space-between g-10px name">
              <a className="product-form-input-title">Pracownik:</a>
              <DropdownSelect<Employee>
                items={employees}
                onChange={handleEmployeeChange}
                value={sharedFields.employee}
                placeholder="Nie wybrano"
                searchable={false}
                multiple={false}
                allowNew={false}
                className="visit-list"
              />
            </div>
            <div className="popup-common-section-row flex align-items-center space-between g-10px name">
              <a className="product-form-input-title">Data:</a>
              <DateInput
                onChange={handleUsageDateChange}
                selectedDate={sharedFields.usageDate}
              />
            </div>
          </div>
          <div className="selected-usage-product-list flex-column height-fit-content width-max align-items-center mt-1 g-05">
            {usageRecordItems.map((item) => (
              <div
                key={item.product.id}
                className="usage-product-item flex-column align-items-center width-97 space-between"
              >
                <div className="usage-item-row flex width-max justify-center">
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
                    <a className="product-form-input-title">Ilość:</a>
                    <DigitInput
                      value={item.quantity}
                      onChange={(value) =>
                        handleQuantityChange(item.product.id, value)
                      }
                      min={1}
                      placeholder="1"
                    />
                  </div>
                  <div className="popup-common-section-row flex align-items-center space-between g-10px name">
                    <a className="product-form-input-title">Powód:</a>
                    <DropdownSelect
                      items={usageReasonItems}
                      value={
                        usageReasonItems.find(
                          (r) => r.id === item.usageReason
                        ) || usageReasonItems[0]
                      }
                      onChange={(selected) => {
                        const reason = Array.isArray(selected)
                          ? selected[0]?.id
                          : selected?.id;
                        if (reason)
                          handleUsageReasonChange(item.product.id, reason);
                      }}
                      searchable={false}
                      allowNew={false}
                      multiple={false}
                      className="usage-reason"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`list-container width-35 height-max `}>
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
            className="products pricelist popup usage"
            onScroll={handleScroll}
            isLoading={loading}
            hasMore={hasMore}
          />
        </div>
      </div>
    </div>
  );
}
export default UsageRecordForm;
