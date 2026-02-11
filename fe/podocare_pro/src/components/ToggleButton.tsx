import React, { useEffect, useState } from "react";

export interface ToggleButtonProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  src?: string;
  alt?: string;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  className?: string;
}

export function ToggleButton({
  value = true,
  onChange,
  src,
  alt,
  prefix,
  suffix,
  disabled = false,
  className = "",
}: ToggleButtonProps) {
  const [isOn, setIsOn] = useState(value);

  const handleToggle = () => {
    if (disabled) return;

    const newValue = !isOn;
    setIsOn(newValue);

    if (onChange) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    if (value) {
      setIsOn(value);
    }
  }, []);

  return (
    <div className={`toggle-button-container flex align-items-center ${className}`}>
      {prefix && <span className={`slider-label mr-025 ${!isOn ? 'selected' : ''}`}>{prefix}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label={prefix || 'Toggle'}
        disabled={disabled}
        onClick={handleToggle}
        className={`toggle-button relative border-none pointer p-0 ${isOn ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      >
        <span className="toggle-slider absolute border-radius-half" />
      </button>
      {suffix && <span className={`slider-label ml-025 ${isOn ? 'selected' : ''}`}>{suffix}</span>}
    </div>
  );
}

export default ToggleButton;
