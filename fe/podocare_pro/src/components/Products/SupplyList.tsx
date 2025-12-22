import React from "react";
import ListHeader from "../ListHeader.js";
import ItemList from "./ItemList.jsx";
import { useState, useEffect, useCallback } from "react";
import AllProductService from "../../services/AllProductService.tsx";
import { ProductFilterDTO } from "../../models/product.tsx";
import { Product } from "../../models/product";
import { PRODUCT_LIST_ATTRIBUTES } from "../../constants/list-headers.ts";
import { useAlert } from "../Alert/AlertProvider.tsx";
import { AlertType } from "../../models/alert.ts";

export interface SupplyListProps {
  filter: ProductFilterDTO;
  setIsAddNewProductsPopupOpen: (isOpen: boolean) => void;
  setIsEditProductsPopupOpen: (isOpen: boolean) => void;
  setRemoveProductId: (productId: string | number | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  className?: string;
}

export function SupplyList ({
  filter,
  setIsAddNewProductsPopupOpen,
  setIsEditProductsPopupOpen,
  setRemoveProductId,
  setSelectedProduct,
  className = "",
}: SupplyListProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();

  const buildFilterDTO = (filter: ProductFilterDTO) => {
    const filterDTO: ProductFilterDTO = {};
    if (filter.categoryIds && filter.categoryIds.length > 0) {
      filterDTO.categoryIds = filter.categoryIds;
    }
    if (filter.brandIds && filter.brandIds.length > 0) {
      filterDTO.brandIds = filter.brandIds;
    }
    if (filter.keyword && filter.keyword.trim() !== "") {
      filterDTO.keyword = filter.keyword;
    }
    if (filter.includeZero !== null) {
      filterDTO.includeZero = filter.includeZero;
    }
    if(filter.isDeleted !== null) {
      filterDTO.isDeleted = filter.isDeleted;
    }

    return filterDTO;
  };

  const fetchItems = async (filter: ProductFilterDTO): Promise<void> => {
    const filterDTO = buildFilterDTO(filter);

    AllProductService.getProducts(filterDTO)
      .then((data) => {
        const sortedItems = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setItems(sortedItems);
        setError(null);
      })
      .catch((error) => {
        setItems([]);
        showAlert("Błąd", AlertType.ERROR);
        setError("Błąd podczas pobierania produktów");
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchItems(filter);
  }, [filter]);

  return (
    <>
      <ListHeader attributes={PRODUCT_LIST_ATTRIBUTES} />
      {loading ? (
        <div className="list-loading-container relative flex align-items-center justify-center">
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
        </div>
      ) : error ? (
        <div className="list-error absolute flex-column justify-items-center align-items-center">
          <h2>Coś poszło nie tak 😵</h2>
        </div>
      ) : (
        <section className="products-list-section width-95 flex align-items-center justify-center mt-05">
          <ItemList
            attributes={PRODUCT_LIST_ATTRIBUTES}
            items={items}
            setIsAddNewProductsPopupOpen={setIsAddNewProductsPopupOpen}
            setIsEditProductsPopupOpen={setIsEditProductsPopupOpen}
            setRemoveProductId={setRemoveProductId}
            setSelectedProduct={setSelectedProduct}
            className="products"
          />
        </section>
      )}
    </>
  );
};

export default SupplyList;
