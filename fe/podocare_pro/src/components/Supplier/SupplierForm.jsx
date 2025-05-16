import React from "react";
import TextInput from "../TextInput";

import { useState, useEffect } from "react";

const SupplierForm = ({ onForwardSupplierForm, action, selectedSupplier }) => {
  const [supplierData, setSupplierData] = useState({
    id: selectedSupplier?.id ?? null,
    name: selectedSupplier?.name ?? "",
    websiteUrl: selectedSupplier?.websiteUrl ?? null,
  });

  useEffect(() => {
    const supplierForm = {
      id: supplierData.id,
      name: supplierData.name,
      websiteUrl: supplierData.websiteUrl,
    };
    onForwardSupplierForm(supplierForm);
  }, [supplierData]);

  const handleSupplierName = (name) => {
    setSupplierData((prev) => ({
      ...prev,
      name: name,
    }));
  };

  const handleWesbiteUrl = (url) => {
    setSupplierData((prev) => ({
      ...prev,
      websiteUrl: url,
    }));
  };

  return (
    <div className="supplier-form-container">
      <section className="supplier-form-core-section">
        <ul className="supplier-form-inputs-section">
          <li className="popup-common-section-row name supplier">
            <a className="supplier-form-input-title">Nazwa:</a>
            <TextInput
              dropdown={false}
              value={selectedSupplier?.name ?? ""}
              onSelect={(inputName) => {
                if (typeof inputName === "string") {
                  handleSupplierName(inputName);
                }
              }}
            />
          </li>
          <li className="popup-common-section-row name supplier">
            <a className="supplier-form-input-title">Strona internetowa:</a>
            <TextInput
              dropdown={false}
              value={selectedSupplier?.websiteUrl ?? ""}
              placeholder={"https://"}
              onSelect={(url) => {
                if (typeof url === "string") {
                  handleWesbiteUrl(url);
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
