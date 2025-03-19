import React from "react";
import { useState, useEffect } from "react";

const CostInput = ({ startValue, onChange, selectedCost, defaultValue, onBlur }) => {
  const [cost, setCost] = useState(selectedCost ?? startValue);

  useEffect(() => {
    if (onChange) {
      onChange(cost);
    }
  }, [cost]);

   useEffect(() => {
      if (defaultValue) {
        setCost(startValue);
      }
    }, [defaultValue]);


/*   useEffect(() => {
      selectedCost  === null ? setCost(null) : setCost(selectedCost);
    }, [selectedCost]); */

    useEffect(() => {
      if (selectedCost !== undefined && selectedCost !== cost) {
        setCost(selectedCost);
      }
    }, [selectedCost]);

  return (
    <div className="digit-input-container">
      <input
        type="number"
        className="cost-input"
        value={cost}
        onChange={(e) => {
          const newCost = parseFloat(e.target.value) || 0.0;
          setCost(newCost);
          onChange?.(newCost);
        }}
        placeholder="0.00"
        step="0.01"
      />
    </div>
  );
};

export default CostInput;
