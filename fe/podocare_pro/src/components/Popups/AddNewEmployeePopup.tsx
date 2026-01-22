import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import EmployeeForm from "../Employee/EmployeeForm";
import { NewEmployee } from "../../models/employee";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

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
  const { showAlert } = useAlert();
  
  const handleCreateEmployee = useCallback(async () => {
    if(employee?.name?.trim() && employee?.secondName?.trim()) {
      await onAddNew(employee);
      onClose();
    }
  }, [employee, onClose, onAddNew]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`} onClick={onClose}>
      <div
        className="add-employee-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="add-new-supplier-header flex">
          <h2 className="popup-title">Nowy Pracownik 👩‍⚕️</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
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
        <div className="popup-footer-container flex-column justify-end mt-25">
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
