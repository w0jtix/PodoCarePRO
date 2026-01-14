import NavigationBar from "../NavigationBar";
import { useState, useCallback, useEffect } from "react";
import ItemList from "../Products/ItemList";
import { Product, ProductFilterDTO } from "../../models/product";
import AllProductService from "../../services/AllProductService";
import {
  PRODUCT_PRICE_LIST_ATTRIBUTES,
  PRODUCT_PRICE_LIST_WIDE_ATTRIBUTES,
} from "../../constants/list-headers";
import { Action } from "../../models/action";
import SearchBar from "../SearchBar";
import ServiceList from "../Services/ServiceList";
import { BaseService, ServiceFilterDTO } from "../../models/service";
import BaseServiceService from "../../services/BaseServiceService";
import { SERVICES_PRICE_LIST_ATTRIBUTES } from "../../constants/list-headers";
import QuickVisit from "../Visit/QuickVisit";
import { BaseServiceCategory } from "../../models/categories";
import BaseServiceCategoryService from "../../services/BaseServiceCategoryService";
import DropdownSelect from "../DropdownSelect";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export function PriceListDashboard() {
  const [keyword, setKeyword] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<BaseServiceCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    BaseServiceCategory[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productFilter, setProductFilter] = useState<ProductFilterDTO>({
    categoryIds: [1],
    keyword: "",
  });
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [services, setServices] = useState<BaseService[]>([]);
  const [serviceFilter, setServiceFilter] = useState<ServiceFilterDTO>({
    categoryIds: null,
    keyword: "",
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedService, setSelectedService] = useState<BaseService | null>(
    null
  );
  const [quickVisitSummaryVisible, setQuickVisitSummaryVisible] =
    useState<boolean>(false);
  const [quickVisitTotal, setQuickVisitTotal] = useState<number>(0);
  const { showAlert } = useAlert();


  const fetchProducts = async (pageNum: number = 0, append: boolean = false): Promise<void> => {
    AllProductService.getProducts(productFilter)
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
  const fetchServices = async (): Promise<void> => {
    BaseServiceService.getServices(serviceFilter)
      .then((data) => {
        const sorted = data.sort(
          (a, b) => (a.category?.id || 0) - (b.category?.id || 0)
        );
        setServices(sorted);
      })
      .catch((error) => {
        setServices([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Services: ", error);
      });
  };
  const fetchCategories = async (): Promise<void> => {
    BaseServiceCategoryService.getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        setCategories([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching categories:", error);
      });
  };

  const handleProductKeywordChange = useCallback((newKeyword: string) => {
    setProductFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);
  const handleServiceKeywordChange = useCallback((newKeyword: string) => {
    setServiceFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);
  const handleFilterByCategory = useCallback(
    (categories: BaseServiceCategory | BaseServiceCategory[] | null) => {
      const categoriesArray = !categories
        ? []
        : Array.isArray(categories)
        ? categories
        : [categories];

      const categoryIds =
        categoriesArray.length > 0
          ? categoriesArray.map((cat) => cat.id)
          : null;

      setSelectedCategories(categoriesArray);

      setServiceFilter((prev) => ({
        ...prev,
        categoryIds: categoryIds,
      }));
    },
    []
  );

  const toggleQuickVisit = () => {
    setQuickVisitSummaryVisible((prev) => !prev);
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [serviceFilter]);

  useEffect(() => {
    fetchProducts(0, false);
    setPage(0);
    setHasMore(true);
  }, [productFilter]);

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

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <NavigationBar showSearchbar={false} />
      <section className="quick-visit-section flex mt-05 mb-05 width-max justify-start height-fit-content align-items-center">
        <div
          className="quick-visit-header-with-details flex g-1 align-items-center pointer"
          onClick={toggleQuickVisit}
        >
          <div className="quick-visit-div flex justify-center align-items-center g-05">
            <img
              src="src/assets/arrow_down.svg"
              alt="Quick Visit Arrow"
              className={`cart-arrow-icon ${
                quickVisitSummaryVisible ? "rotated" : ""
              }`}
            ></img>
            <img
              src="src/assets/cart.svg"
              alt="Quick Visit Creator"
              className="cart-icon"
            ></img>
          </div>
          <div className="qv-hwd-services flex g-5px">
            <span className="qv-hwd-span">Razem:</span>
            <span className="qv-hwd-span">{quickVisitTotal}zł</span>
          </div>
        </div>
      </section>
      <div className="lists-container flex width-93 space-between height-fit-content">
        <div
          className="width-37"
          style={{ display: quickVisitSummaryVisible ? "flex" : "none" }}
        >
          <QuickVisit
            products={products}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            setQuickVisitTotal={setQuickVisitTotal}
          />
        </div>

        <div
          className={`list-container ${
            quickVisitSummaryVisible ? "width-27" : "width-42"
          }`}
        >
          <h2 className="text-align-center">Usługi</h2>
          <div className={`filters-container ${
            quickVisitSummaryVisible ? "flex-column g-05" : "flex g-25"} width-max align-items-center justify-center `}>
            <SearchBar
              onKeywordChange={handleServiceKeywordChange}
              resetTriggered={false}
              placeholder="Szukaj usługi..."
              className={`pricelist`}
            />
            <DropdownSelect
              items={categories}
              value={selectedCategories}
              onChange={handleFilterByCategory}
              placeholder="Wybierz kategorie"
              searchable={false}
              allowNew={false}
              className={`categories`}
              multiple={true}
            />
          </div>
          <ServiceList
            attributes={SERVICES_PRICE_LIST_ATTRIBUTES}
            items={services}
            onClick={(serv) => {
              setSelectedService(serv);
              setQuickVisitSummaryVisible(true);
            }}
            className="services pricelist"
          />
        </div>
        <div
          className={`list-container ${
            quickVisitSummaryVisible ? "width-20" : "width-42"
          }`}
        >
          <h2 className="text-align-center">Dostępne Produkty</h2>
          <div className="filters-container flex width-max align-items-center justify-center">
            <SearchBar
              onKeywordChange={handleProductKeywordChange}
              resetTriggered={false}
              placeholder="Szukaj produktu..."
              className="pricelist"
            />
          </div>
          <ItemList
            attributes={
              quickVisitSummaryVisible
                ? PRODUCT_PRICE_LIST_ATTRIBUTES
                : PRODUCT_PRICE_LIST_WIDE_ATTRIBUTES
            }
            items={products}
            action={Action.DISPLAY}
            onClick={(prod) => {
              setSelectedProduct(prod);
              setQuickVisitSummaryVisible(true);
            }}
            className="products pricelist"
            onScroll={handleScroll}
            isLoading={loading}
            hasMore={hasMore}
          />
        </div>
      </div>
    </div>
  );
}

export default PriceListDashboard;
