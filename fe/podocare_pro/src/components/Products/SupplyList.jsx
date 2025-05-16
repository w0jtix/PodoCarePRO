import React from "react";
import ListHeader from "../ListHeader.jsx";
import ItemList from "./ItemList.jsx";
import { useState, useEffect } from "react";
import AllProductService from "../../service/AllProductService.jsx";

const SupplyList = ({
  filters,
  setIsAddNewProductsPopupOpen,
  setIsEditProductsPopupOpen,
  setIsRemoveProductsPopupOpen,
  setSelectedProduct,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  const attributes = [
    { name: "", width: "2%", justify: "end" },
    { name: "#", width: "3%", justify: "center" },
    { name: "Nazwa", width: "56%", justify: "flex-start" },
    { name: "Marka", width: "16%", justify: "center" },
    { name: "Stan Magazynowy", width: "16%", justify: "center" },
    { name: "Opcje", width: "8%", justify: "center" },
  ];

  const buildFilterDTO = (filters) => {
    const filterDTO = {};
    if (filters.categoryIds.length > 0) {
      filterDTO.categoryIds = filters.categoryIds;
    }
    if (filters.brandIds.length > 0) {
      filterDTO.brandIds = filters.brandIds;
    }
    if (filters.keyword.trim() !== "") {
      filterDTO.keyword = filters.keyword;
    }
    if (filters.includeZero !== null) {
      filterDTO.includeZero = filters.includeZero;
    }
    if(filters.isDeleted !== null) {
      filterDTO.isDeleted = filters.isDeleted;
    }

    return filterDTO;
  };

  const fetchItems = async (filters) => {
    const filterDTO = buildFilterDTO(filters);

    AllProductService.getProducts(filterDTO)
      .then((response) => {
        const sortedItems = response.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setItems(sortedItems);
      })
      .catch((error) => {
        setItems([]);
        console.error("Error fetching products:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchItems(filters);
    setCurrentPage(1);
  }, [filters]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  return (
    <>
      <ListHeader attributes={attributes} />
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
            attributes={attributes}
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
