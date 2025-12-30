import React, { useCallback } from "react";
import { useState, useRef, useEffect } from "react";

interface SuggestionItem {
  id: string | number;
  [key: string]: any;
}

export interface TextInputProps<T extends SuggestionItem = SuggestionItem> {
  onSelect?:(value: string | T) => void;
  dropdown?: boolean;
  placeholder?: string;
  displayValue?: keyof T;
  value?: string;
  suggestions?: T[];
  multiline?: boolean;
  rows?: number;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  numbersOnly?: boolean;
}

export function TextInput<T extends SuggestionItem = SuggestionItem> ({
  onSelect,
  dropdown = false,
  placeholder,
  displayValue = "name" as keyof T,
  value = "",
  suggestions = [],
  multiline = false,
  rows,
  className = "",
  disabled = false,
  maxLength,
  numbersOnly = false,
}: TextInputProps<T>) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const capitalizeFirstLetter = (string: string): string => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatNumberWithSpaces = (value: string): string => {
    return value.replace(/(\d{3})(?=\d)/g, '$1 ');
  };

  const getDisplayText = (item: T): string => {
    const displayText = item[displayValue];
    return typeof displayText === "string" ? displayText : String(displayText);
  }

  useEffect(() => {
    if (!isUserInteracting) {
      setKeyword(capitalizeFirstLetter(value ?? ""));
    }
  }, [value, isUserInteracting]);

  useEffect(() => {
    if (value.length > 0 && suggestions.length > 0) {
      const matchedSuggestion = suggestions.find(
        (s) => getDisplayText(s).toLowerCase() === value.toLowerCase()
      );
      if (matchedSuggestion) {
        setSelectedItem(matchedSuggestion);
      }
    }
  }, [value, suggestions, displayValue]);

  useEffect(() => {
    setIsDropdownOpen(dropdown && isUserInteracting && keyword.length > 0 && suggestions.length > 0
    );
  }, [keyword, isUserInteracting, dropdown, suggestions.length]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    let inputValue = e.target.value;

    if (numbersOnly) {
      inputValue = inputValue.replace(/\D/g, '');
    }

    const capitalizedValue = capitalizeFirstLetter(inputValue);
    setKeyword(numbersOnly ? inputValue : capitalizedValue);
    if (multiline) {
      onSelect?.(inputValue);
    } else {
      if (
        selectedItem &&
        getDisplayText(selectedItem).toLowerCase() !== inputValue.toLowerCase()
      ) {
        setSelectedItem(null);
        if (onSelect) {
          onSelect?.(inputValue);
        }
      } else if (!selectedItem) {
        onSelect?.(inputValue);
      }
      setIsUserInteracting(true);
      setIsDropdownOpen(
        dropdown && inputValue.length > 0 && suggestions.length > 0
      );
    }
  }, [dropdown, suggestions.length, numbersOnly]);

  const handleSelect = useCallback((item: T): void => {
    setSelectedItem(item);
    setKeyword(getDisplayText(item));
    setIsDropdownOpen(false);
    setIsUserInteracting(false);
    onSelect?.(item);
  },[]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (multiline) return;
    if (event.key == "Enter" && keyword && !selectedItem) {
      /* onSelect(keyword); */
      event.preventDefault();
      const matchedSuggestion = suggestions.find(
        (s) => getDisplayText(s).toLowerCase() === keyword.toLowerCase()
      );

      if (matchedSuggestion) {
        handleSelect(matchedSuggestion);
      } else {
        onSelect?.(keyword);
      }

      setIsDropdownOpen(false);
      setTimeout(() => {
        setIsUserInteracting(false);
      }, 0);
    }
  }, [multiline, keyword, selectedItem]);

  const handleInputBlur = useCallback((): void => {
    if (multiline) return;
    if (keyword !== undefined && !selectedItem) {
      const matchedSuggestion = suggestions.find(
        (s) => getDisplayText(s).toLowerCase() === keyword.toLowerCase()
      );

      if (matchedSuggestion) {
        handleSelect(matchedSuggestion);
      } else {
        onSelect?.(keyword);
      }
    }
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 0);
  },[keyword, multiline, selectedItem]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const getInputValue= (): string => {
    let displayValue: string;

    if (isUserInteracting) {
      displayValue = keyword;
    } else if (selectedItem) {
      displayValue = getDisplayText(selectedItem);
    } else {
      displayValue = keyword;
    }

    return numbersOnly ? formatNumberWithSpaces(displayValue) : displayValue;
  }

  const filteredSuggestions = suggestions.filter(suggestion =>
    getDisplayText(suggestion).toLowerCase().includes(keyword.toLowerCase())
  );

  if (multiline) {
    return (
      <textarea
        rows={rows}
        className={`textarea-input flex width-max p-10px align-items-center space-between g-10px pointer transparent ${className}`}
        placeholder={placeholder}
        value={keyword}
        onChange={handleInputChange}
        disabled={disabled}
      />
    );
  }

  return (
        <div className={`input-container relative inline-block transparent ${className}`} ref={dropdownRef}>
          <input
            type="text"
            className={`text-input flex align-items-center space-between g-10px pointer transparent category ${className}`}
            placeholder={placeholder}
            value={getInputValue()}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            onBlur={handleInputBlur}
            disabled={disabled}
            maxLength={maxLength}
          />
          {dropdown &&
            isDropdownOpen &&
            keyword != "" &&
            filteredSuggestions.length > 0 && (
              <ul
                className={`text-input-dropdown transparent absolute height-fit-content p-0 text-align-left ${
                  suggestions.length === 1
                    ? "one-slot"
                    : suggestions.length === 2
                    ? "two-slot"
                    : "regular-size"
                }`}
              >
                {suggestions.slice(0, 3).map((suggestion) => (
                  <li
                    key={suggestion.id}
                    className="text-input-dropdown-item flex justify-start align-items-center pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(suggestion);
                    }}
                  >
                    {getDisplayText(suggestion)}
                  </li>
                ))}
              </ul>
            )}
        </div>
      )
};

export default TextInput;
