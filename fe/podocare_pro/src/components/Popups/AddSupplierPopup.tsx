import React from "react";
import ReactDOM from "react-dom";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import SupplierForm from "../Supplier/SupplierForm";
import { NewSupplier } from "../../models/supplier";

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
  
  const handleCreateSupplier = useCallback(async () => {
    if(supplier?.name?.trim()) {
      await onAddNew(supplier);
      onClose();
    }
  }, [supplier, onClose, onAddNew]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay ${className}`} onClick={onClose}>
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
          onForwardSupplierForm={setSupplier}
        />
        <div className="popup-footer-container">{/* </div> */}
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
