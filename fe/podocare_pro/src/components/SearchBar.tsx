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
    <div className="searchbar-container">
        <img src={iconSrc} alt={iconAlt} className="dashboard-icon"></img>
        <input 
          className="search-bar-stock" 
          placeholder={placeholder}
          value={keyword}
          onChange={handleInputChange}
          />
    </div>
  )
}

export default SearchBar
