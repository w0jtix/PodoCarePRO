import React, { useEffect } from 'react'
import { useState, useCallback } from 'react'

export interface SearchBarProps {
  onKeywordChange: (keyword: string) => void;
  resetTriggered: boolean;
  iconSrc?: string;
  iconAlt?: string;
  placeholder?: string;
}

export function SearchBar ({ 
  onKeywordChange, 
  resetTriggered,
  iconSrc = "src/assets/searchbar_icon.svg",
  iconAlt = "Searchbar icon",
  placeholder = "Szukaj..."
}: SearchBarProps) {

  const [keyword, setKeyword] = useState<string>("");

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = event.target.value;
    setKeyword(newKeyword);

    onKeywordChange(newKeyword);
  }, [onKeywordChange]);

  useEffect(() => {
    if (resetTriggered) {
      setKeyword("");
      onKeywordChange("");
    }
  }, [resetTriggered]);

  return (
    <div className="searchbar-container flex width-25 align-self-center g-1">
        <img src={iconSrc} alt={iconAlt} className="dashboard-icon align-self-center ml-05"></img>
        <input 
          className="search-bar-stock align-self-center border-none" 
          placeholder={placeholder}
          value={keyword}
          onChange={handleInputChange}
          />
    </div>
  )
}

export default SearchBar
