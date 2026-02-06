import CategoryButtons from "../CategoryButtons";
import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { ProductFilterDTO, Product } from "../../models/product";
import { ProductCategory } from "../../models/categories";
import CategoryService from "../../services/CategoryService";
import AllProductService from "../../services/AllProductService";
import ItemList from "../Products/ItemList";
import { PRODUCT_POPUP_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { CategoryButtonMode } from "../../models/categories";
import { Brand } from "../ListActionSection";
import DropdownSelect from "../DropdownSelect";
import BrandService from "../../services/BrandService";

export interface ProductReportPopupProps {
  onClose: () => void;
  className?: string;
}

export function ProductReportPopup({
  onClose,
  className = "",
}: ProductReportPopupProps) {
  const [filter, setFilter] = useState<ProductFilterDTO>({
    categoryIds: null,
    brandIds: null,
    keyword: "",
    includeZero: false,
    isDeleted: false,
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    ProductCategory[]
  >([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Brand[]>([]);
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const { showAlert } = useAlert();

  const fetchItems = async (pageNum: number = 0, append: boolean = false): Promise<void> => {
    setLoading(true);
    AllProductService.getProducts(filter, pageNum, 30)
      .then((data) => {
        const content = data?.content || [];

        if (append) {
          setItems((prev) => [...prev, ...content]);
        } else {
          setItems(content);
        }

        setHasMore(!data.last);
        setPage(pageNum);
        setLoading(false);
      })
      .catch((error) => {
        if (!append) setItems([]);
        setLoading(false);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching products:", error);
      });
  };

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
  const fetchBrands = async (): Promise<void> => {
    BrandService.getBrands()
      .then((data) => {
        const sortedBrands = data.sort((a, b) => a.name.localeCompare(b.name));
        setBrands(sortedBrands);
      })
      .catch((error) => {
        setBrands([]);
      });
  };

  const handleResetFiltersAndData = useCallback(() => {
    setFilter({
      categoryIds: null,
      brandIds: null,
      keyword: "",
      includeZero: false,
      isDeleted: false,
    });
    setResetTriggered((prev) => !prev);
    setSelectedBrands([]);
    setSelectedCategories([]);
  }, []);

  const handleCategoryChange = useCallback((categories: ProductCategory[] | null) => {
      if (categories && categories.length > 0) {
        setSelectedCategories(categories);
        setFilter((prev) => ({
          ...prev,
          categoryIds: categories.map((c) => c.id),
        }));
      } else {
        setSelectedCategories([]);
        setFilter((prev) => ({
          ...prev,
          categoryIds: null,
        }));
      }
    },
    []
  );
  const handleBrandChange = useCallback((selected: Brand | Brand[] | null) => {
    const brandsArray = !selected
      ? []
      : Array.isArray(selected)
      ? selected
      : [selected];
    if (brandsArray && brandsArray.length > 0) {
      setSelectedBrands(brandsArray);
      setFilter((prev) => ({
        ...prev,
        brandIds: brandsArray.map((b) => b.id),
      }));
    } else {
      setSelectedBrands([]);
      setFilter((prev) => ({
        ...prev,
        brandIds: null,
      }));
    }
  }, []);
  const toggleIncludeZero = useCallback(() => {
    setFilter((prev) => ({
      ...prev,
      includeZero: !prev.includeZero,
    }));
  }, []);

  const handlePreviewPDF = useCallback(async () => {
    try {
      const blob = await AllProductService.generateInventoryReport(filter);
      const url = window.URL.createObjectURL(blob);

      const today = new Date();
      const dateStr = today.toLocaleDateString('pl-PL');
      const filename = `Stan magazynowy-${dateStr}.pdf`;

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.title = filename;

        const style = newWindow.document.createElement('style');
        style.textContent = 'body { margin: 0; } iframe { width: 100%; height: 100vh; border: none; }';
        newWindow.document.head.appendChild(style);

        const iframe = newWindow.document.createElement('iframe');
        iframe.src = url;
        newWindow.document.body.appendChild(iframe);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      showAlert("Błąd generowania PDF", AlertType.ERROR);
    }
  }, [filter, showAlert]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchItems(0, false);
    setPage(0);
    setHasMore(true);
  }, [filter]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list

      if (scrolledToBottom && hasMore && !loading) {
        fetchItems(page + 1, true);
      }
    },
    [hasMore, loading, page, filter]
  );

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      onClick={onClose}
    >
      <div
        className="product-report-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-15">
          <h2 className="popup-title">Utwórz Plik PDF</h2>
          <button
            className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <div className="flex-column g-1 width-max align-items-center">
          <section className="flex width-80 align-items-center space-between">
            <a className="order-history-action-buttons-a align-center">
              Kategorie:
            </a>
            <CategoryButtons
              categories={categories}
              selectedCategories={selectedCategories}
              onSelect={handleCategoryChange}
              resetTriggered={resetTriggered}
              mode={CategoryButtonMode.MULTISELECT}
            />
          </section>
          <section className="flex width-80 align-items-center space-between g-1">
            <ActionButton
              disableImg={true}
              text={`Zerowy Stan Magazynowy: ${
                filter.includeZero ? "TAK" : "NIE"
              } `}
              onClick={toggleIncludeZero}
              className={`supply-filter ${filter.includeZero ? "active-g" : "active-r"}`}
            />
            <DropdownSelect<Brand>
              items={brands}
              value={selectedBrands}
              onChange={handleBrandChange}
              placeholder="Wybierz markę"
              multiple={true}
              allowNew={false}
              className="brand-dropdown"
            />
            
            <ActionButton
                    src={"src/assets/reset.svg"}
                    alt={"Reset filters"}
                    iconTitle={"Resetuj filtry"}
                    text={"Reset"}
                    onClick={handleResetFiltersAndData}
                    disableText={true}
                  />
          </section>
          <section className="products-list-section width-90 flex align-items-center justify-center mt-05">
            <ItemList
              attributes={PRODUCT_POPUP_LIST_ATTRIBUTES}
              items={items}
              className="products report"
              onScroll={handleScroll}
              isLoading={loading}
              hasMore={hasMore}
            />
          </section>
        </div>
            
        <ActionButton
          src={"src/assets/pdf.svg"}
          alt={"Utwórz PDF"}
          text={"Utwórz PDF"}
          onClick={handlePreviewPDF}
          className="f-1 product-report"
        />
      </div>
    </div>,
    portalRoot
  );
}

export default ProductReportPopup;
