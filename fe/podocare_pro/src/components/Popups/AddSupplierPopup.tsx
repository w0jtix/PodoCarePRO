import React from "react";
import ReactDOM from "react-dom";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import SupplierForm from "../Supplier/SupplierForm";
import { NewSupplier } from "../../models/supplier";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface AddSupplierPopupProps {
  onClose: () => void;
  onAddNew: (supplier: NewSupplier) => void | Promise<void>;
  className?: string;
}

export function AddSupplierPopup ({ 
  onClose, 
  onAddNew,
  className= "" 
}: AddSupplierPopupProps) {
  const [supplier, setSupplier] = useState<NewSupplier | null>(null);
  const { showAlert } = useAlert();
  
  const handleCreateSupplier = useCallback(async () => {
    if(supplier?.name?.trim()) {
      await onAddNew(supplier);
      onClose();
    }
  }, [supplier, onClose, onAddNew]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`} onClick={onClose}>
      <div
        className="add-supplier-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="add-new-supplier-header flex">
          <h2 className="popup-title">Dodaj nowy sklep</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <SupplierForm
          onForwardSupplierForm={setSupplier}
        />
        <div className="popup-footer-container flex-column justify-end">
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleCreateSupplier}
          disabled={!supplier?.name?.trim()}
        />
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default AddSupplierPopup;
