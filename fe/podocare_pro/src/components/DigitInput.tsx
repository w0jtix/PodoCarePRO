import React, { ChangeEvent, useCallback, useEffect } from "react";
import { useState } from "react";

export interface DigitInputProps {
  value?: number | string;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

export function DigitInput ({ 
  value,
  onChange,
  disabled = false,
  placeholder = "",
  min = 0,
  max = 99,
  className = "",
 }: DigitInputProps) {

  const [internalValue, setInternalValue] = useState<string>(() => 
    value !== undefined && value !== null ? String(value) : ""
  );

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setInternalValue(String(value));
    } else {
      setInternalValue("");
    }
  }, [value]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if(disabled) return;

    const inputValue = e.target.value;

    if (!/^\d*$/.test(inputValue)) return;

    const maxDigits = String(max).length;
    if (inputValue.length > maxDigits) return;

    const numericValue = inputValue === "" ? null : Number(inputValue);
    if (numericValue !== null && (numericValue < min || numericValue > max)) {
      return;
    }
   setInternalValue(inputValue);
    onChange(numericValue);
  }, [disabled, onChange, min, max]);

  const handleBlur = useCallback(() => {
    if (internalValue && internalValue !== "0") {
      const formatted = String(Number(internalValue));
      if (formatted !== internalValue) {
        setInternalValue(formatted);
      }
    }
  }, [internalValue]);


  return (
    <div className={`digit-input-container ${disabled ? "disabled" : ""}`}>
      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        className={`new-products-popup-digit-input align-items-center space-between g-10px transparent justify-items-center ${
          disabled ? "disabled" : ""
        } ${className}`}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
      />
    </div>
  );
};

export default DigitInput;
