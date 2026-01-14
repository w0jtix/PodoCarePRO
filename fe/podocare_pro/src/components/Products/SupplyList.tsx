import React from "react";
import ListHeader from "../ListHeader.js";
import ItemList from "./ItemList.jsx";
import { useState, useEffect, useCallback } from "react";
import AllProductService from "../../services/AllProductService.tsx";
import { ProductFilterDTO } from "../../models/product.tsx";
import { Product } from "../../models/product";
import { PRODUCT_LIST_ATTRIBUTES, PRODUCT_VOLUME_LIST_ATTRIBUTES } from "../../constants/list-headers.ts";
import { useAlert } from "../Alert/AlertProvider.tsx";
import { AlertType } from "../../models/alert.ts";

export interface SupplyListProps {
  filter: ProductFilterDTO;
  setIsAddNewProductsPopupOpen: (isOpen: boolean) => void;
  setEditProductId: (productId: string | number | null) => void;
  setRemoveProductId: (productId: string | number | null) => void;
  className?: string;
  productInfo?: boolean;
}

export function SupplyList ({
  filter,
  setIsAddNewProductsPopupOpen,
  setEditProductId,
  setRemoveProductId,
  className = "",
  productInfo = false,
}: SupplyListProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
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

  const fetchItems = async (pageNum: number = 0, append: boolean = false): Promise<void> => {
    setLoading(true);
    const filterDTO = buildFilterDTO(filter);

    AllProductService.getProducts(filterDTO, pageNum, 30)
      .then((data) => {
        const content = data?.content || [];

        if (append) {
          setItems(prev => [...prev, ...content]);
        } else {
          setItems(content);
        }

        setHasMore(!data.last);
        setPage(pageNum);
        setLoading(false);
      })
      .catch((error) => {
        if(!append) setItems([]);
        setLoading(false);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching products:", error);
      })
  };

  useEffect(() => {
    fetchItems(0, false);
    setPage(0);
    setHasMore(true);
  }, [filter]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrolledToBottom = 
        target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list
  
      if (scrolledToBottom && hasMore && !loading) {
        fetchItems(page + 1, true);
      }
    }, [hasMore, loading, page, filter]);

  return (
    <>
      <ListHeader attributes={productInfo ? PRODUCT_VOLUME_LIST_ATTRIBUTES : PRODUCT_LIST_ATTRIBUTES} />
      {loading ? (
        <div className="list-loading-container relative flex align-items-center justify-center">
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
        </div>
      ) : (
        <section className="products-list-section width-95 flex align-items-center justify-center mt-05">
          <ItemList
            attributes={productInfo ? PRODUCT_VOLUME_LIST_ATTRIBUTES : PRODUCT_LIST_ATTRIBUTES}
            items={items}
            setIsAddNewProductsPopupOpen={setIsAddNewProductsPopupOpen}
            setEditProductId={setEditProductId}
            setRemoveProductId={setRemoveProductId}
            className="products"
            productInfo={productInfo}
            onScroll={handleScroll}
            isLoading={loading}
            hasMore={hasMore}
          />
        </section>
      )}
    </>
  );
};

export default SupplyList;
