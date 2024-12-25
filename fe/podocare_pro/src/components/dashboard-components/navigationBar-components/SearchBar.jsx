import React from 'react'
import { useState } from 'react'

const SearchBar = ({ onFilter, productFilterDTO }) => {

  const [keyword, setKeyword] = useState("");

  const handleInputChange = (event) => {
    const newKeyword = event.target.value;
    setKeyword(newKeyword);

    const updatedFilterDTO = {
      ...productFilterDTO,
      keyword: newKeyword
    }

    onFilter(updatedFilterDTO);
  }

  return (
    <div className="searchbar-container">
        <img src="src/assets/searchbar_icon.svg" alt="searchbar-icon" className="dashboard-icon"></img>
        <input 
          className="search-bar" 
          placeholder='Szukaj...'
          value={keyword}
          onChange={handleInputChange}
          />
    </div>
  )
}

export default SearchBar
