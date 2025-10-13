import { NewServiceVariant, ServiceVariant } from "../../models/service";
import { Action } from "../../models/action";
import { useState, useEffect } from "react";
import TextInput from "../TextInput";
import DigitInput from "../DigitInput";

export interface VariantFormProps {
  variant: ServiceVariant | NewServiceVariant;
  handleVariant: (variant: ServiceVariant | NewServiceVariant) => void;
  action: Action;
  className?: string;
}

export function VariantForm({
  variant,
  handleVariant,
  action,
  className = "",
}: VariantFormProps) {
  const [localVariant, setLocalVariant] = useState(variant);

  useEffect(() => {
    setLocalVariant(variant);
  }, [variant]);

  const handleChange = (key: keyof typeof variant, value: any) => {
    const updated = { ...localVariant, [key]: value };
    setLocalVariant(updated);
    handleVariant(updated);
  };

  return (
    <div
      className={`custom-form-container ${action
        .toString()
        .toLowerCase()} ${className}`}
    >
        <div className="variant-form-label-input-wrapper">
      <section className="form-row">
        <span className={`input-label ${className}`}>Nazwa:</span>
        <TextInput
          dropdown={false}
          value={localVariant.name}
          onSelect={(inputName) => {
            if (typeof inputName === "string") {
              handleChange("name", inputName)
            }
          }}
          className="name"
        />
      </section>
      <section className="form-row">
        <span className={`input-label ${className}`}>Czas trwania (min):</span>
        <DigitInput
          onChange={(val) => handleChange("duration", val ?? 0)}
          value={localVariant.duration}
          max={999}
          className={"service"}
        />
      </section>
      <section className="form-row">
        <span className={`input-label ${className}`}>Cena:</span>
        <DigitInput
          onChange={(val) => handleChange("price", val ?? 0)}
          value={localVariant.price}
          max={999}
          className={"service"}
        />
      </section>
      </div>
    </div>
  );
}

export default VariantForm;
