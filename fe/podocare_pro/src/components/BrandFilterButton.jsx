import React from 'react'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import ExpandedFilterList from './ExpandedFilterList';

const BrandFilterButton = ( { onSave, brandFilterDTO }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [brands, setBrands] = useState([]);
    const filterRef = useRef(null);

    const filteredBrands = brands
              .filter((brand) => brand.name.toLowerCase().includes(keyword.toLowerCase())
            ).sort();

    const fetchBrands = async () => {
      const {productTypes, keyword } = brandFilterDTO;

      if (productTypes.length === 0) {
        setBrands([]);
        return;
      }
      try{
        const response = await axios.post(
          "http://localhost:8080/brands/filter",
          { 
            productTypes: productTypes,
            keyword: keyword
           } )
          if(response.status === 204 || !response.data) {
            setBrands([]);
          } else {
          setBrands(response.data);
          }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    }        

    useEffect(() => {
     fetchBrands();
    }, [brandFilterDTO]);

    const handleInputChange = (event) => {
      const newKeyword = event.target.value;
      setKeyword(newKeyword);
      setIsExpanded(true);
  }

    const expandFilter =  () => {
        setIsExpanded((prev) => !prev);
    }

    const handleSaveFilter = (newSelectedIds) => {
      const { productTypes } = brandFilterDTO;
      const productFilterDTO = {
        productTypes: productTypes,
        selectedIds: newSelectedIds,
      }
      onSave(productFilterDTO);
      setIsExpanded(false);
    }

      useEffect(() => {
          const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsExpanded(false)
            }
          };
          document.addEventListener('mousedown', handleClickOutside);
      
          return () => { document.removeEventListener('mousedown', handleClickOutside)
        };
        }, []);
      

  return (
    <div className={`supplier-filter-container ${isExpanded ? 'expand' : ''}`} ref={filterRef}>
      <div className="supplier-filter-container-visible">      
        <input 
            className="search-bar-orders" 
            placeholder='Szukaj marki...'
            value={keyword}
            onChange={handleInputChange}
        />
        <div className="dropdown-button" onClick={expandFilter}>
            <img 
              src="src/assets/arrow_down.svg" 
              alt="arrow down" 
              className={`arrow-down ${isExpanded ? 'rotated' : ''}`}/>
        </div>
      </div>
        {isExpanded && <ExpandedFilterList  itemList={filteredBrands} onSave={handleSaveFilter}/>}
    </div>
  )
}

export default BrandFilterButton
