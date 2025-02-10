import React from "react";
import { useState } from "react";

const DigitInput = ({ onShelfLifeInput }) => {
  const [shelfLife, setShelfLife] = useState(24);

  const handleDigitInputChange = (value) => {
    if (/^\d{0,2}$/.test(value)) {
      setShelfLife(value);
      if (onShelfLifeInput) {
        onShelfLifeInput(value);
      }
    }
  };
  return (
    <div className="digit-input-container">
      <input
        type="text"
        inputMode="numeric"
        pattern="^\d{1,2}$"
        maxLength="2"
        className="new-products-popup-digit-input"
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
