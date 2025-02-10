import React from 'react'
import { useState } from 'react'

const SearchBar = ({ onKeywordChange }) => {

  const [keyword, setKeyword] = useState("");

  const handleInputChange = (event) => {
    const newKeyword = event.target.value;
    setKeyword(newKeyword);

    onKeywordChange(newKeyword);
  }

  return (
    <div className="searchbar-container">
        <img src="src/assets/searchbar_icon.svg" alt="searchbar-icon" className="dashboard-icon"></img>
        <input 
          className="search-bar-stock" 
          placeholder='Szukaj...'
          value={keyword}
          onChange={handleInputChange}
          />
    </div>
  )
}

export default SearchBar
