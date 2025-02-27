import React, { useEffect } from "react";
import { useState } from "react";

const DigitInput = ({ onInputValue, startValue, disabled, defaultValue }) => {
  const [shelfLife, setShelfLife] = useState(startValue);

  useEffect(() => {
    if (defaultValue) {
      setShelfLife(startValue);
    }
  }, [defaultValue]);

  const handleDigitInputChange = (value) => {
    if (disabled) return;
    if (/^\d{0,2}$/.test(value)) {
      const numericValue = value === "" ? "" : Number(value);
      setShelfLife(numericValue);
      if (onInputValue) {
        onInputValue(numericValue);
      }
    }
  };
  return (
    <div className={`digit-input-container ${disabled ? "disabled" : ""}`}>
      <input
        type="text"
        inputMode="numeric"
        pattern="^\d{1,2}$"
        maxLength="2"
        className={`new-products-popup-digit-input ${
          disabled ? "disabled" : ""
        }`}
        placeholder=""
        value={shelfLife}
        onChange={(e) => {
          handleDigitInputChange(e.target.value);
        }}
      />
    </div>
  );
};

export default DigitInput;
