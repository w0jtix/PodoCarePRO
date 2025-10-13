import { BaseServiceAddOn, NewBaseServiceAddOn } from "../../models/service";
import { useState, useEffect, useCallback } from "react";
import { Action } from "../../models/action";
import ActionButton from "../ActionButton";
import ReactDOM from "react-dom";
import AddOnForm from "../Services/AddOnForm";
import { useAlert } from "../Alert/AlertProvider";
import { validaAddOnForm } from "../../utils/validators";
import { AlertType } from "../../models/alert";
import BaseServiceAddOnService from "../../services/BaseServiceAddOnService";
import { extractAddOnErrorMessage } from "../../utils/errorHandler";

export interface AddOnPopupProps {
  className?: string;
  selectedAddOn?: BaseServiceAddOn | null;
  
  onClose: () => void;
}

export function AddOnPopup({ 
    className = "", 
    selectedAddOn,
    onClose,
}: AddOnPopupProps) {
  const [addOnDTO, setAddOnDTO] = useState<NewBaseServiceAddOn>({
          name: "",
          price: 0,
          duration: 0,
        });
  const action = selectedAddOn ? Action.EDIT : Action.CREATE;
  const { showAlert } = useAlert();

  useEffect(() => {
        if (selectedAddOn) {
        setAddOnDTO(selectedAddOn);
        }
    }, [selectedAddOn]);

   const handleAddOnAction = useCallback(async () => {
        if(!addOnDTO) return;

        try {
            const error = validaAddOnForm(addOnDTO, selectedAddOn, action);
            if (error) {
                showAlert(error, AlertType.ERROR);
                return;
            }
            if(action === Action.CREATE) {
                await BaseServiceAddOnService.createAddOn(addOnDTO as NewBaseServiceAddOn);
                showAlert(`Dodatek ${addOnDTO.name} został utworzony!`, AlertType.SUCCESS);               
            } else if (action === Action.EDIT && selectedAddOn && 'id' in selectedAddOn && selectedAddOn.id) {              
                await BaseServiceAddOnService.updateAddOn(selectedAddOn.id, addOnDTO as NewBaseServiceAddOn);
                showAlert(`Dodatek ${addOnDTO.name} został zaktualizowany!`, AlertType.SUCCESS);               
            }            
            onClose();           
        } catch (error) {
            console.error(`Error ${action === Action.CREATE ? 'creating' : 'updating'} addOn:`, error);
            const errorMessage = extractAddOnErrorMessage(error, action);
            showAlert(errorMessage, AlertType.ERROR);
        }
   },[
    addOnDTO, action, selectedAddOn, onClose, showAlert
   ]) 

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay ${className}`} onClick={onClose}>
      <div
        className="addon-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Nowy Dodatek" : "Edytuj Dodatek"}
          </h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="custom-form-section">
            <AddOnForm
                setAddOnDTO={setAddOnDTO}
                action={action}
                addOnDTO={addOnDTO}
                className=""
            />
        </section>
        <ActionButton
                  src={"src/assets/tick.svg"}
                  alt={"Zapisz"}
                  text={"Zapisz"}
                  onClick={handleAddOnAction}
                  className="addon-save"
                />
      </div>
    </div>,
    portalRoot
  );
}

export default AddOnPopup;
