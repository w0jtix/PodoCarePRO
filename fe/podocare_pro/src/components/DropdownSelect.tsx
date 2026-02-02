import React, { useCallback } from "react";
import { useState, useRef, useEffect } from "react";

/* single select -> item
multi select -> array of items */
export interface DropdownItem {
  id: string | number;
  name?: string;
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
  getItemLabel?: (item: T) => string;
  searchable?: boolean;
  allowNew?: boolean;
  showTick?: boolean;
  multiple?: boolean;
  reversed?: boolean;
  showNewPopup?: boolean;
  allowColors?: boolean;
  divided?: boolean;
  newItemComponent?: React.ComponentType<any> /* React.ComponentType<NewItemComponentProps>; */;
  newItemProps?: Record<string, any>;

  disabled?: boolean;
  disabledItemIds?: (string | number)[];
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
  getItemLabel,
  searchable = true,
  allowNew = true,
  showTick = true,
  multiple = false,
  reversed = false,
  showNewPopup = false,
  allowColors = false,
  divided = false,
  newItemComponent: NewItemComponent,
  newItemProps = {},
  disabled = false,
  disabledItemIds = [],
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

  /* const filteredItems = items.filter((item) =>
    item.name.toLowerCase().startsWith(searchValue.toLowerCase())
  ); */
  const filteredItems = items.filter((item) =>
  (getItemLabel ? getItemLabel(item) : item.name!)
    .toLowerCase()
    .startsWith(searchValue.toLowerCase())
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
      if (selectedItems.length === 1){
        const item = selectedItems[0];
    return item.name || `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
      } 
      return `[${selectedItems.length}]`;
    }

    const item = selectedItems[0];
    return item.name || `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
  };

  const isItemSelected = (item: T): boolean => {
    return selectedItems.some((s) => s.id === item.id);
  };

  const isItemDisabled = (item: T): boolean => {
    return disabledItemIds.includes(item.id);
  };

  return (
    <div className={`searchable-dropdown relative height-auto transparent border-none ${className}`} ref={dropdownRef}>
      <button
        className={`dropdown-header flex space-between align-items-center transparent pointer ${className} ${disabled ? "disabled" : ""} ${
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
        <div className="dropdown-placeholder-wrapper width-max">
          <a
            className={`dropdown-header-a flex align-items-center justify-center ${className} ${((className === "categories" && multiple) ||
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
          className={`arrow-down ${isDropdownVisible ? "rotated" : ""} ${className}`}
        />
      </button>
      {isDropdownVisible && !isAddNewPopupOpen && (
        <div className={`dropdown-menu ${reversed ? "reversed" : ""} ${divided ? "divided" : ""}  absolute mt-05 ${className}`}>
          {(searchable || allowNew) && (
            <section className="dropdown-search-and-add-new flex space-between">
              <input
                type="text"
                className={`dropdown-search width-75 transparent border-none ${!allowNew ? "width-90" : ""}`}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {allowNew && NewItemComponent && (
                <button
                  className="add-new-dropdown-button transparent border-none align-self-center flex justify-center pointer"
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
          <ul className={`dropdown-list m-0 p-0 ${divided ? "divided" : ""} ${className}`}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <li
                  key={item.id}
                  className={`dropdown-item flex align-items-center space-between ${
                    isItemSelected(item) ? "selected" : ""
                  } ${isItemDisabled(item) ? "disabled" : "pointer"} ${className}`}
                  onClick={() => !isItemDisabled(item) && handleSelect(item)}
                >
                  <div className={`dropdown-left flex align-items-center g-05 ml-05 ${className}`}>
                  {item.color && (
                    <span
                      className="color-symbol"
                      style={{
                        backgroundColor: `rgb(${item.color})`,
                      }}
                    />
                  )}
                  {getItemLabel ? getItemLabel(item) : item.name}
                  </div>
                  {showTick && isItemSelected(item) && (
                    <img
                      src={tickIcon}
                      alt="Selected"
                      className={`dropdown-tick-icon ${className} `}
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
