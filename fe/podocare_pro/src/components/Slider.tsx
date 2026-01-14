import React, { useEffect, useState, useCallback } from 'react';
import ToggleButton from './ToggleButton'

interface SliderProps {
  min?: number;
  max?: number;
  value?: number;
  step?: number;
  onChange?: (value: number) => void;
  toggleOn?: boolean;
  toggleValue?: boolean;
  toggleChange?:(isOn : boolean) => void;
  label?: string;
  unit?: string;
  className?: string;
  showValue?: boolean;
  description?: string;
}

export function Slider({
  min = 0,
  max = 100,
  value = 0,
  step = 1,
  onChange,
  toggleOn = false,
  toggleValue,
  toggleChange,
  label,
  unit = '',
  className = '',
  showValue = true,
  description
}: SliderProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const isDisabled = toggleValue === false;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setCurrentValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleToggleChange = useCallback((isOn: boolean) => {
    if(toggleChange){
      toggleChange(isOn);
    }
  }, [])

  const percentage = ((currentValue - min) / (max - min)) * 100;

  useEffect(() => {
    if(value) {
        setCurrentValue(value);
    }
    
  },[value])

  return (
    <div className={`slider-container width-90 ${className}`}>
      <div className="flex space-between width-max align-items-start">
      {label && (
        <div className="slider-header flex align-items-center justify-start g-2 mb-2">
          <label className={`slider-label ${isDisabled ? "opacity-30" :""}`}>{label}</label>
          {showValue && (
            <span className={`slider-value ${isDisabled ? "opacity-30" :""}`}>
              {currentValue}{unit}
            </span>
          )}
        </div>
        
      )}
      {toggleOn && (
        <ToggleButton
          value={toggleValue}
          label={"Boost:"}
          onChange={handleToggleChange}
        />
      )}
      
        </div>
      <div className="slider-wrapper relative width-max">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={isDisabled}
          onChange={handleChange}
          className={`slider-input width-max ${isDisabled ? "not-allowed opacity-30" :"pointer"}`}
          style={{
            background: `linear-gradient(to right, #fbc50c 0%, #fbc50c ${percentage}%, rgba(255,255,255,0.15) ${percentage}%, rgba(255,255,255,0.15) 100%)`
          }}
        />
      </div>
      <div className={`slider-desc mt-2 text-align-justify ${isDisabled ? "opacity-30" :""}`}>
        <span>{description}</span>
      </div>
    </div>
  );
}

