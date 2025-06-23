import React from "react";
import ListHeader from "../ListHeader.js";
import ItemList from "./ItemList.jsx";
import { useState, useEffect, useCallback } from "react";
import AllProductService from "../../services/AllProductService.tsx";
import { ProductFilterDTO } from "../../models/product.tsx";
import { Product } from "../../models/product";
import { ListAttribute, PRODUCT_LIST_ATTRIBUTES } from "../../constants/list-headers.ts";



export interface SupplyListProps {
  filter: ProductFilterDTO;
  setIsAddNewProductsPopupOpen: (isOpen: boolean) => void;
  setIsEditProductsPopupOpen: (isOpen: boolean) => void;
  setIsRemoveProductsPopupOpen: (isOpen: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  className?: string;
}

export function SupplyList ({
  filter,
  setIsAddNewProductsPopupOpen,
  setIsEditProductsPopupOpen,
  setIsRemoveProductsPopupOpen,
  setSelectedProduct,
  className = ""
}: SupplyListProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 14;

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
    setCurrentPage(1);
  }, [filter]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  },[]);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  },[]);

  return (
    <>
      <ListHeader attributes={PRODUCT_LIST_ATTRIBUTES} />
      {loading ? (
        <div className="list-loading-container">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      ) : error ? (
        <div className="list-error">
          <h2>Coś poszło nie tak 😵</h2>
        </div>
      ) : (
        <>
          <ItemList
            attributes={PRODUCT_LIST_ATTRIBUTES}
            items={currentItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setIsAddNewProductsPopupOpen={setIsAddNewProductsPopupOpen}
            setIsEditProductsPopupOpen={setIsEditProductsPopupOpen}
            setIsRemoveProductsPopupOpen={setIsRemoveProductsPopupOpen}
            setSelectedProduct={setSelectedProduct}
          />
          {items.length > itemsPerPage && (
            <div className="list-pagination">
              <button
                className="list-prev-page-button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <img
                  className="pagination-img"
                  src="src/assets/previousPage.svg"
                  alt="previous page"
                />
              </button>
              <span className="page-info">
                {currentPage} / {totalPages}
              </span>
              <button
                className="list-next-page-button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <img
                  className="pagination-img"
                  src="src/assets/nextPage.svg"
                  alt="next page"
                />
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default SupplyList;
