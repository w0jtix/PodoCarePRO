import React from 'react'
import SupplyListHeader from './supplyList-components/SupplyListHeader'
import ListHelpBar from './supplyList-components/ListHelpBar'
import ItemList from './supplyList-components/ItemList'
import axios from 'axios';
import { useState, useEffect } from 'react';

const SupplyList = ( { productFilterDTO }) => {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage]= useState(1);
    const itemsPerPage = 12;

    const attributes = [
        { name:"", width: "2%", justify: "center" },
        { name:"#", width: "3%", justify: "center" },
        { name:"Nazwa", width: "55%", justify: "flex-start" },
        { name:"Marka", width: "20%", justify: "center" },
        { name:"Stan Magazynowy", width: "20%", justify: "center" },
    ];

    const fetchItems = async (productFilterDTO) => {
        const {productTypes, selectedBrandIds, keyword } = productFilterDTO; 

        try{
            const response = await axios.post(
                "http://localhost:8080/products/filter", 
                {
                    productTypes,
                    selectedBrandIds,
                    keyword,
                  }
            );
            if(response.status === 204 || !response.data) {
                setItems([]);
            } else {
                setItems(response.data);
            }
            
        } catch (error) {
            console.error(
                "Error fetching products:", error); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchItems(productFilterDTO);
        
    }, [productFilterDTO]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    }

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    }


  return (
    <>
        <ListHelpBar/> 
        <SupplyListHeader attributes={attributes}/>
        {loading ?(
            <div className="list-loading-container">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
            </div>
        ) : error ? (
            <div className="list-error">
                <h2>
                    Coś poszło nie tak 😵
                </h2>
            </div>
        ) : (
            <>
            <ItemList 
            attributes={attributes} 
            items={currentItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            />
            {items.length > itemsPerPage && (
                <div className="list-pagination">
                    <button
                        className='list-prev-page-button'
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        <img className="pagination-img" src="src/assets/previousPage.svg" alt="previous page"/>
                    </button>
                    <span className="page-info">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        className='list-next-page-button'
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <img className="pagination-img" src="src/assets/nextPage.svg" alt="next page"/>
                    </button>
                </div>
                )}
            </>
        )}
        
    </>
  )
}

export default SupplyList