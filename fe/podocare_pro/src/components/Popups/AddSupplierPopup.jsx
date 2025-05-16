import React from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import ProductActionButton from "../ProductActionButton";
import SupplierForm from "../Supplier/SupplierForm";

const AddSupplierPopup = ({ onClose, onAddNew }) => {
  const [supplierDTO, setSupplierDTO] = useState(null);

  const handleCreateSupplier = (supplierDTO) => {
    onAddNew(supplierDTO);
  };

  return ReactDOM.createPortal(
    <div className="add-popup-overlay" onClick={onClose}>
      <div
        className="add-supplier-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="add-new-supplier-header">
          <h2 className="popup-title">Dodaj nowy sklep</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <SupplierForm
          onForwardSupplierForm={(supplierForm) => {
            setSupplierDTO(supplierForm);
          }}
          action={"Create"}
        />
        <div className="popup-footer-container"></div>
        <ProductActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={async () => handleCreateSupplier(supplierDTO)}
        />
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default AddSupplierPopup;
