import React from "react";
import TextInput from "../TextInput";
import { useState, useEffect, useCallback } from "react";
import { Supplier, NewSupplier } from "../../models/supplier";

export interface SupplierFormProps {
  onForwardSupplierForm: (supplier: Supplier | NewSupplier) => void;
  selectedSupplier?: Supplier | null;
  className?: string;
}

export function SupplierForm ({ 
  onForwardSupplierForm, 
  selectedSupplier,
  className=""
 }: SupplierFormProps) {

  const getInitialData = (): Supplier | NewSupplier => {
    if (selectedSupplier) {
      return {
        id: selectedSupplier.id,
        name: selectedSupplier.name,
        websiteUrl: selectedSupplier.websiteUrl
      };
    }
    return {
      name: "",
      websiteUrl: ""
    };
  };
  const [supplierData, setSupplierData] = useState<Supplier | NewSupplier>(getInitialData);

  useEffect(() => {
    setSupplierData(getInitialData());
  }, [selectedSupplier]);

  useEffect(() => {
    onForwardSupplierForm(supplierData);
  }, [supplierData]);

  const handleSupplierName = useCallback((name: string) => {
    setSupplierData((prev) => ({
      ...prev,
      name,
    }));
  }, []);

  const handleWebsiteUrl = useCallback((url: string) => {
    setSupplierData((prev) => ({
      ...prev,
      websiteUrl: url || undefined,
    }));
  }, []);

  const getName = (): string => {
    return 'name' in supplierData ? supplierData.name || "" : "";
  };

  const getWebsiteUrl = (): string => {
    return supplierData.websiteUrl || "";
  };

  return (
    <div className={`supplier-form-container flex-column ${className}`}>
      <section className="supplier-form-core-section flex">
        <ul className="supplier-form-inputs-section width-95 flex-column p-0 mt-0 mb-0 align-self-center g-2">
          <li className="popup-common-section-row align-items-center space-between mt-15  name flex-column g-15px">
            <a className="supplier-form-input-title">Nazwa:</a>
            <TextInput
              dropdown={false}
              value={getName()}
              onSelect={(inputName) => {
                if (typeof inputName === "string") {
                  handleSupplierName(inputName);
                }
              }}
            />
          </li>
          <li className="popup-common-section-row align-items-center space-between mt-15  name flex-column g-15px">
            <a className="supplier-form-input-title">Strona internetowa:</a>
            <TextInput
              dropdown={false}
              value={getWebsiteUrl()}
              placeholder="https://"
              onSelect={(url) => {
                if (typeof url === "string") {
                  handleWebsiteUrl(url);
                }
              }}
            />
          </li>
        </ul>
      </section>
    </div>
  );
};

export default SupplierForm;
