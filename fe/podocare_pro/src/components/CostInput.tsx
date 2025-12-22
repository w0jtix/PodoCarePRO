import React, { useCallback } from "react";
import { useState, useEffect } from "react";

export interface CostInputProps {
  initialValue?: number;
  onChange: (value: number) => void;
  selectedCost?: number;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const CostInput = ({ 
  initialValue = 0.0, 
  onChange, 
  selectedCost, 
  disabled = false, 
  placeholder = "0",
  min = 0,
  max,
  step = 0.01,
  className = "",
}: CostInputProps) => {
  const [cost, setCost] = useState<number>(selectedCost ?? initialValue);

  useEffect(() => {
    onChange(cost);
  }, [cost]);

  useEffect(() => {
    if (selectedCost !== undefined && selectedCost !== cost) {
      setCost(selectedCost);
    }
  }, [selectedCost]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const inputValue = e.target.value;

    if (inputValue ==="") {
      setCost(0);
      return;
    }

    const newCost = parseFloat(inputValue);

    if(!isNaN(newCost)) {
      let constrainedCost = newCost;
      if (min !== undefined && constrainedCost < min) {
        constrainedCost = min;
      }
      if (max !== undefined && constrainedCost > max) {
        constrainedCost = max;
      }
      setCost(constrainedCost);
    }
  },[min, max, setCost]);

  const handleBlur = useCallback((): void => {
    const roundedCost = Math.round(cost *100) / 100;
    if( roundedCost !== cost) {
      setCost(roundedCost);
    }
  }, [cost, onChange]);

  return (    
    <div className={`digit-input-container ${disabled ? "disabled" : ""} ${className}`}>
      <input
        type="number"
        className={`cost-input flex align-items-center space-between g-10px pointer transparent text-align-center ${disabled ? "disabled" : ""}  ${className}`}
        value={cost}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
      />
    </div>
  );
};

export default CostInput;
