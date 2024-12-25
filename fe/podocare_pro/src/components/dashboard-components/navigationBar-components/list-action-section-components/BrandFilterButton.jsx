import React from 'react'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios';

const BrandFilterButton = ( { onSave, productTypes }) => {

    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBrandIds, setSelectedBrandIds] = useState([]);
    const [brands, setBrands] = useState([]);
    const filterRef = useRef(null);

    const filteredBrands = brands
              .filter((brand) => brand.brandName.toLowerCase().includes(searchTerm.toLowerCase())
            ).sort();

    const fetchBrands = async () => {
      if (productTypes.length === 0) {
        setBrands([]);
        return;
      }
      try{
        const response = await axios.post(
          "http://localhost:8080/brands/filter",
          { productTypes: productTypes } )
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
    }, [productTypes]);

    const expandFilter =  () => {
        setIsExpanded((prev) => !prev);
    }

    const handleBrandSelect = (brandId) => {
        setSelectedBrandIds((prev) => prev.includes(brandId) ? 
        prev.filter((id) => id !== brandId) : [...prev,brandId]);
      };

    const handleClear = () => {
      setSelectedBrandIds([]);
    }

    const handleSave = async () => {
      const productFilterDTO = {
        productTypes: productTypes,
        selectedBrandIds: selectedBrandIds,
      }
      onSave(productFilterDTO);
      setIsExpanded(false);
    }

      useEffect(() => {
          const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsExpanded(false)
                handleClear();
            }
          };
          document.addEventListener('mousedown', handleClickOutside);
      
          return () => { document.removeEventListener('mousedown', handleClickOutside)
        };
        }, []);
      

  return (
    <div className="brand-filter-container" ref={filterRef}>
      <div className="brand-filter-button" onClick={expandFilter} >      
        <h2 className="category-button-h2">Marka</h2>
        <div className="dropdown-button">
            <img 
              src="src/assets/arrow_down.svg" 
              alt="arrow down" 
              className={`arrow-down ${isExpanded ? 'rotated' : ''}`}/>
        </div>
        {isExpanded &&
            <div 
            className="brand-filter-expand" 
            onClick={(e) => e.stopPropagation()} 
            >
              <input
                type="text"
                placeholder='Szukaj marki'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='brand-searchbar'
              />
              <div className="brand-list">
                {filteredBrands.map((brand) => (
                  <label key={brand.brandId} className='brand-item'>
                    
                    <input
                    type='checkbox'
                    checked={selectedBrandIds.includes(brand.brandId)}
                    onChange={() => handleBrandSelect(brand.brandId)}
                    />{brand.brandName}<span></span>
                    
                  </label>
                ))}
              </div>
              <div className='brand-action-buttons'>
                <button onClick={handleClear} className="brand-clear-button">
                  <h2>Wyczyść</h2>
                </button>
                <button onClick={handleSave} className="brand-save-button">
                  <h2>Zapisz</h2>
                </button>
              </div>
            </div>
        }
      </div>
    </div>
  )
}

export default BrandFilterButton
