import React from 'react'
import { useState, useEffect } from 'react'

const ColorPicker = ( { onColorSelect, selectedColor }) => {
    const [color, setColor] = useState("");

    const handleColorChange = (e) => {
        setColor(e.target.value);
      };

    const hexToRgb = (hex) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `${r},${g},${b}`;
    };

    const rgbToHex = (rgb) => {
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

      useEffect(() => {
        if(!selectedColor) {
          setColor("#34ebd2");
        }
      },[])

      useEffect(() => {
        if (selectedColor) {
          setColor(rgbToHex(selectedColor));
        }
      }, [selectedColor]);

      useEffect(() => {
        const rgb = hexToRgb(color);
        onColorSelect(rgb);
      },[color])

  return (
    <div>
      <input type="color" className="color-input" value={color} onChange={handleColorChange} />
    </div>
  )
}

export default ColorPicker
