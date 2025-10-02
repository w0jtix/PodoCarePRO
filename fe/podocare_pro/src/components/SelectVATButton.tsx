import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { VatRate, getVatRateDisplay } from "../models/vatrate";

export interface SelectVatButtonProps {
  selectedVat: VatRate | null;
  onSelect: (vatRate: VatRate) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SelectVATButton({
  selectedVat,
  onSelect,
  placeholder = "0%",
  disabled = false,
}: SelectVatButtonProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<VatRate | null>(
    selectedVat || VatRate.VAT_8
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const vatValues: VatRate[] = Object.values(VatRate);

  useEffect(() => {
    setSelectedItem(selectedVat);
  }, [selectedVat]);

  const handleSelect = useCallback(
    (item: VatRate) => {
      setSelectedItem(item);
      onSelect(item);
      setIsExpanded(false);
    },
    [onSelect]
  );

  const toggleDropdown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!disabled) {
        setIsExpanded((prev) => !prev);
      }
    },
    [disabled]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="vat-select-container" ref={dropdownRef}>
      <button className="vat-select-button" onClick={toggleDropdown}>
        <a className="vat-button-selection">
          {selectedItem ? getVatRateDisplay(selectedItem) : placeholder}
        </a>
        <img
          src="src/assets/arrow_down.svg"
          alt="arrow down"
          className={`vat-select-arrow-icon ${isExpanded ? "rotated" : ""}`}
        />
      </button>
      {isExpanded && !disabled && (
        <ul className="vat-select">
          {vatValues.map((item) => (
            <li
              key={item}
              className={`vat-select-item ${
                selectedItem === item ? "selected" : ""
              }`}
              onClick={() => handleSelect(item)}
            >
              {getVatRateDisplay(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelectVATButton;
