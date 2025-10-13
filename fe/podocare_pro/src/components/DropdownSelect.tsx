import React, { useCallback } from "react";
import { useState, useRef, useEffect } from "react";

/* single select -> item
multi select -> array of items */
export interface DropdownItem {
  id: string | number;
  name: string;
  [key: string]: any;
}

/* interface NewItemComponentProps {
  onClose: () => void;
  onAdd?: (item: any) => void;
  [key: string]: any;
} */

export interface DropdownSelectProps<T extends DropdownItem> {
  items: T[];
  placeholder?: string;
  value?: T | T[] | null;
  onChange: (value: T | T[] | null) => void;
  searchable?: boolean;
  allowNew?: boolean;
  showTick?: boolean;
  multiple?: boolean;
  showNewPopup?: boolean;
  allowColors?: boolean;
  newItemComponent?: React.ComponentType<any> /* React.ComponentType<NewItemComponentProps>; */;
  newItemProps?: Record<string, any>;

  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  arrowIcon?: string;
  tickIcon?: string;
  addNewIcon?: string;
  maxHeight?: number;
}

export function DropdownSelect<T extends DropdownItem>({
  items,
  placeholder = "",
  value,
  onChange,
  searchable = true,
  allowNew = true,
  showTick = true,
  multiple = false,
  showNewPopup = false,
  allowColors = false,
  newItemComponent: NewItemComponent,
  newItemProps = {},
  disabled = false,
  className = "",
  searchPlaceholder = "Szukaj...",
  emptyMessage = "Nie znaleziono 🙄",
  arrowIcon = "src/assets/arrow_down.svg",
  tickIcon = "src/assets/tick.svg",
  addNewIcon = "src/assets/addNew.svg",
  maxHeight = 300,
}: DropdownSelectProps<T>) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [isAddNewPopupOpen, setIsAddNewPopupOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSelectedValue = useCallback((): T[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedItems = getSelectedValue();

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().startsWith(searchValue.toLowerCase())
  );

  const handleSelect = useCallback(
    (item: T) => {
      if (disabled) return;

      if (multiple) {
        const currentSelected = getSelectedValue();
        const isSelected = currentSelected.some((s) => s.id === item.id);

        const newSelected = isSelected
          ? currentSelected.filter((s) => s.id !== item.id)
          : [...currentSelected, item];

        onChange(newSelected);
      } else {
        const currentSelected = value as T | null;
        const newSelected = currentSelected?.id === item.id ? null : item;

        onChange(newSelected);
        setIsDropdownVisible(false);
      }
    },
    [multiple, value, onChange, disabled, getSelectedValue]
  );

  const handleOpenAddNewPopup = useCallback(() => {
    if (disabled) return;
    setIsAddNewPopupOpen(true);
    /* setIsDropdownVisible(false); */
  }, [disabled]);

  const handleCloseAddNewPopup = useCallback(() => {
    setIsAddNewPopupOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isDropdownVisible) {
      setSearchValue("");
    }
  }, [isDropdownVisible]);

  const getDisplayText = (): string => {
    if (selectedItems.length === 0) return placeholder;

    if (multiple) {
      if (selectedItems.length === 1) return selectedItems[0].name;
      return `[${selectedItems.length}]`;
    }

    return selectedItems[0].name;
  };

  const isItemSelected = (item: T): boolean => {
    return selectedItems.some((s) => s.id === item.id);
  };

  return (
    <div className={`searchable-dropdown ${className}`} ref={dropdownRef}>
      <button
        className={`dropdown-header ${className} ${disabled ? "disabled" : ""} ${
          allowColors && selectedItems.length > 0 ? "selected" : ""
        } `}
        onClick={() => !disabled && setIsDropdownVisible((prev) => !prev)}
        disabled={disabled}
        style={
     !multiple && selectedItems.length > 0 && selectedItems[0]?.color
      ? {
          border: `1px solid rgb(${selectedItems[0].color},0.9)`,
          boxShadow: `inset 0 0 65px rgba(${selectedItems[0].color}, 0.2)`,
        }
      : {}
  }
      >
        <div className="dropdown-placeholder-wrapper">
          <a
            className={`dropdown-header-a ${((className === "categories" && multiple) ||
  (className !== "categories")) && (
              selectedItems.length > 0 ? "center" : "")
            }`}
          >
            {getDisplayText()}
          </a>
        </div>
        <img
          src={arrowIcon}
          alt="Toggle dropdown"
          className={`arrow-down ${isDropdownVisible ? "rotated" : ""}`}
        />
      </button>
      {isDropdownVisible && !isAddNewPopupOpen && (
        <div className="dropdown-menu">
          {(searchable || allowNew) && (
            <section className="dropdown-search-and-add-new">
              <input
                type="text"
                className={`dropdown-search ${!allowNew ? "wide" : ""}`}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {allowNew && NewItemComponent && (
                <button
                  className="add-new-dropdown-button"
                  onClick={handleOpenAddNewPopup}
                >
                  <img
                    src={addNewIcon}
                    alt="Add new item"
                    className="dropdown-add-new-icon"
                  />
                </button>
              )}
            </section>
          )}
          <ul className={`dropdown-list ${className}`}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <li
                  key={item.id}
                  className={`dropdown-item ${
                    isItemSelected(item) ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="dropdown-left">
                  {item.color && (
                    <span
                      className="color-symbol"
                      style={{
                        backgroundColor: `rgb(${item.color})`,
                      }}
                    />
                  )}
                  {item.name}
                  </div>
                  {showTick && isItemSelected(item) && (
                    <img
                      src={tickIcon}
                      alt="Selected"
                      className="dropdown-tick-icon"
                    />
                  )}
                </li>
              ))
            ) : (
              <li className="dropdown-item disabled">{emptyMessage}</li>
            )}
          </ul>
        </div>
      )}
      {showNewPopup && isAddNewPopupOpen && NewItemComponent && (
        <NewItemComponent onClose={handleCloseAddNewPopup} {...newItemProps} />
      )}
    </div>
  );
}

export default DropdownSelect;
