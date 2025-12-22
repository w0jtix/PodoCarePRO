import React, { useEffect, useState } from "react";

interface ToggleButtonProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  src?: string;
  alt?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function ToggleButton({
  value = true,
  onChange,
  src,
  alt,
  label,
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
    <div className={`toggle-button-container flex align-items-center g-1 ${className}`}>
      {label && <span className="slider-label">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label={label || 'Toggle'}
        disabled={disabled}
        onClick={handleToggle}
        className={`toggle-button relative border-none pointer p-0 ${isOn ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      >
        <span className="toggle-slider absolute border-radius-half" />
      </button>
    </div>
  );
}

export default ToggleButton;
