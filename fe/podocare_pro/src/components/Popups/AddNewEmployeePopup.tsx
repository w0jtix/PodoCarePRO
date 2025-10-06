import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import EmployeeForm from "../Employee/EmployeeForm";
import { NewEmployee } from "../../models/employee";

export interface AddEmployeePopupProps {
  onClose: () => void;
  onAddNew: (employee: NewEmployee) => void | Promise<void>;
  className?: string;
}

export function AddEmployeePopup ({ 
  onClose, 
  onAddNew,
  className= "" 
}: AddEmployeePopupProps) {
  const [employee, setEmployee] = useState<NewEmployee | null>(null);
  
  const handleCreateEmployee = useCallback(async () => {
    if(employee?.name?.trim() && employee?.secondName?.trim()) {
      await onAddNew(employee);
      onClose();
    }
  }, [employee, onClose, onAddNew]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay ${className}`} onClick={onClose}>
      <div
        className="add-employee-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="add-new-supplier-header">
          <h2 className="popup-title">Nowy Pracownik 👩‍⚕️</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <EmployeeForm
          onForwardEmployeeForm={setEmployee}
          className="emp"
        />
        <div className="popup-footer-container">
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleCreateEmployee}
          disabled={!employee?.name?.trim() && !employee?.secondName?.trim()}
        />
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default AddEmployeePopup;
