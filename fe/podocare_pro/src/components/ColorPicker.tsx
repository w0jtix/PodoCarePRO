import React from "react";
import { useState, useEffect, useCallback } from "react";

export interface ColorPickerProps {
  onColorSelect: (rgbColor: string) => void;
  selectedColor?: string;
  defaultColor?: string;
}

const rgbToHex = (rgb: string): string => {
  if (!rgb) return "#000000";
  const [r, g, b] = rgb.split(",").map(Number);
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

const hexToRgb = (hex: string): string => {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
};

export function ColorPicker({
  onColorSelect,
  selectedColor,
  defaultColor = "#34ebd2",
}: ColorPickerProps) {
  const [color, setColor] = useState<string>(() => {
    if (selectedColor) {
      return rgbToHex(selectedColor);
    }
    return defaultColor;
  });

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setColor(e.target.value);
  },[]);

  useEffect(() => {
    if (selectedColor) {
      setColor(rgbToHex(selectedColor));
    }
  }, [selectedColor]);

  useEffect(() => {
    const rgb = hexToRgb(color);
    onColorSelect(rgb);
  }, [color]);

  return (
    <div>
      <input
        type="color"
        className="color-input transparent border-none pointer"
        value={color}
        onChange={handleColorChange}
      />
    </div>
  );
}

export default ColorPicker;
