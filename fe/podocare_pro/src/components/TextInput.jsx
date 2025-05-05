import React from "react";
import { useState, useRef, useEffect } from "react";

const TextInput = ({
  onSelect,
  dropdown = false,
  placeholder,
  displayValue = "name",
  value = "",
  suggestions = [],
  multiline = false,
  rows,
}) => {
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  useEffect(() => {
    if (!isUserInteracting) {
      setKeyword(capitalizeFirstLetter(value ?? ""));
    }
  }, [value]);

  useEffect(() => {
    if (value.length > 0) {
      const matchedSuggestion = suggestions.find(
        (s) => s[displayValue].toLowerCase() === value.toLowerCase()
      );
      setSelectedItem(matchedSuggestion);
    }
  }, []);

  useEffect(() => {
    setIsDropdownOpen(dropdown && isUserInteracting && keyword.length > 0);
  }, [keyword, isUserInteracting, dropdown]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const capitalizedValue = capitalizeFirstLetter(inputValue);
    setKeyword(capitalizedValue);
    if (multiline) {
      if (onSelect) onSelect(inputValue);
    } else {
      if (
        selectedItem &&
        selectedItem[displayValue].toLowerCase() !== inputValue.toLowerCase()
      ) {
        setSelectedItem(null);
        if (onSelect) {
          onSelect(inputValue);
        }
      } else if (!selectedItem) {
        if (onSelect) {
          onSelect(inputValue);
        }
      }
      setIsUserInteracting(true);
      setIsDropdownOpen(
        dropdown && inputValue.length > 0 && suggestions.length > 0
      );
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    setKeyword(item[displayValue]);
    setIsDropdownOpen(false);
    setIsUserInteracting(false);
    if (onSelect) {
      onSelect(item);
    }
  };

  const handleKeyPress = (event) => {
    if (multiline) return;
    if (event.key == "Enter" && keyword && !selectedItem) {
      onSelect(keyword);
      const matchedSuggestion = suggestions.find(
        (s) => s[displayValue].toLowerCase() === keyword.toLowerCase()
      );

      if (matchedSuggestion) {
        handleSelect(matchedSuggestion);
      } else {
        onSelect(keyword);
      }

      setIsDropdownOpen(false);
      setIsUserInteracting(false);
    }
  };

  const handleInputBlur = () => {
    if (multiline) return;
    if (keyword !== undefined && !selectedItem) {
      const matchedSuggestion = suggestions.find(
        (s) => s[displayValue].toLowerCase() === keyword.toLowerCase()
      );

      if (matchedSuggestion) {
        handleSelect(matchedSuggestion);
      } else {
        if (onSelect) onSelect(keyword);
      }
    }
    setIsUserInteracting(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      {multiline ? (
        <textarea
          rows={rows}
          className="textarea-input"
          placeholder={placeholder}
          value={keyword}
          onChange={handleInputChange}
        />
      ) : (
        <div className="input-container" ref={dropdownRef}>
          <input
            type="text"
            className="text-input"
            placeholder={placeholder}
            value={
              isUserInteracting
                ? keyword
                : selectedItem
                ? selectedItem[displayValue]
                : keyword
            }
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={handleInputBlur}
          />
          {dropdown &&
            isDropdownOpen &&
            keyword != "" &&
            suggestions.length > 0 && (
              <ul
                className={`text-input-dropdown ${
                  suggestions.length === 1
                    ? "one-slot"
                    : suggestions.length === 2
                    ? "two-slot"
                    : suggestions.length > 2
                    ? "regular-size"
                    : ""
                }`}
              >
                {suggestions.slice(0, 3).map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="text-input-dropdown-item"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(suggestion);
                    }}
                  >
                    {suggestion[displayValue]}
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}
    </>
  );
};

export default TextInput;
