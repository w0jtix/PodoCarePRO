import { BaseServiceAddOn } from "../../models/service";
import { useState, useEffect, useCallback } from "react";
import BaseServiceAddOnService from "../../services/BaseServiceAddOnService";
import ActionButton from "../ActionButton";
import RemovePopup from "./RemovePopup";
import ReactDOM from "react-dom";
import { Action } from "../../models/action";
import AddOnPopup from "./AddOnPopup";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface SelectAddOnsPopupProps {
  onClose: () => void;
  className?: string;
  onSave?: () => void;
  handleSelectAddOns?: (addOn: BaseServiceAddOn) => void;
  attachedAddOns?: BaseServiceAddOn[];
  action: Action;
}

export function SelectAddOnsPopup({
  onClose,
  onSave,
  className = "",
  handleSelectAddOns,
  attachedAddOns,
  action,
}: SelectAddOnsPopupProps) {
  const [addOnToAdjust, setAddOnToAdjust] = useState<BaseServiceAddOn | null>(
    null
  );
  const [isAddOnPopupOpen, setIsAddOnPopupOpen] = useState<boolean>(false);
  const [isRemoveAddOnPopupOpen, setIsRemoveAddOnPopupOpen] =
    useState<boolean>(false);
  const [availableAddOns, setAvailableAddOns] = useState<BaseServiceAddOn[]>(
    []
  );
  const { showAlert } = useAlert();

  const fetchAddOns = async (): Promise<void> => {
    BaseServiceAddOnService.getAddOns()
      .then((data) => {
        setAvailableAddOns(data);
      })
      .catch((error) => {
        setAvailableAddOns([]);
        console.error("Error fetching AddOns: ", error);
      });
  };

  const handleAddOnRemove = useCallback(async () => {
    if (addOnToAdjust) {
      BaseServiceAddOnService.deleteAddOn(addOnToAdjust.id)
        .then(() => {
          showAlert("Dodatek pomyślnie usunięty!", AlertType.SUCCESS);
          setIsRemoveAddOnPopupOpen(false);    
          fetchAddOns();     
        })
        .catch((error) => {
          console.error("Error removing AddOn", error);
          showAlert("Błąd usuwania dodatku.", AlertType.ERROR);
        }); 
        setAddOnToAdjust(null);       
    }
  }, [addOnToAdjust, showAlert]);

  useEffect(() => {
    fetchAddOns();
  }, []);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      onClick={onClose}
    >
      <div
        className="select-addons-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="addons-popup-header mb-1">
          <h2 className="popup-title">{`${
            action === Action.SELECT ? "Wybierz Dodatki" : "Zarządzaj Dodatkami"
          }`}</h2>
          <button
            className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        {action === Action.MANAGE && (
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowy Dodatek"}
            text={"Nowy Dodatek"}
            onClick={() => setIsAddOnPopupOpen(true)}
            className="addon-create"
          />
        )}

        <section
          className={`addons-list flex-column g-05 width-max ${
            action === Action.SELECT ? "select-mode" : ""
          }`}
        >
          {availableAddOns.map((addOn) => (
            <div
              key={addOn.id}
              className={`addon-item width-max flex align-items-center ${className} ${
                attachedAddOns?.some((a) => a.id === addOn.id) ? "selected" : ""
              }`}
              onClick={() => {
                if (action === Action.SELECT && handleSelectAddOns) {
                  handleSelectAddOns(addOn);
                }
              }}
            >
              <span className="addon-item-name width-75 ml-1">
                {addOn.name}
              </span>
              <span className="addon-item-duration text-align-center">
                {addOn.duration}min
              </span>
              <span className="addon-item-price text-align-center">
                {addOn.price}zł
              </span>
              {action === Action.MANAGE && (
                <>
                  <ActionButton
                    src="src/assets/edit.svg"
                    alt="Edytuj Usługę"
                    text="Edytuj"
                    onClick={() => {
                      setAddOnToAdjust(addOn);
                      setIsAddOnPopupOpen(true);
                    }}
                    disableText={true}
                    className="addon-edit"
                  />
                  <ActionButton
                    src="src/assets/cancel.svg"
                    alt="Usuń Usługę"
                    text="Usuń"
                    onClick={() => {
                      setAddOnToAdjust(addOn);
                      setIsRemoveAddOnPopupOpen(true);
                    }}
                    disableText={true}
                    className="addon-edit"
                  />
                </>
              )}
            </div>
          ))}
        </section>
        {action === Action.SELECT && (
          <ActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={() => {
              if (onSave) onSave();
              onClose();
            }}
            className="addon-select"
          />
        )}
      </div>
      {isAddOnPopupOpen && (
        <AddOnPopup
          className="ce-addon"
          onClose={() => {
            fetchAddOns();
            setIsAddOnPopupOpen(false);
            setAddOnToAdjust(null);
          }}
          selectedAddOn={addOnToAdjust}
        />
      )}
      {isRemoveAddOnPopupOpen && (
        <RemovePopup
          onClose={() => {
            fetchAddOns();
            setIsRemoveAddOnPopupOpen(false);
            setAddOnToAdjust(null);
          }}
          handleRemove={handleAddOnRemove}
          selectedItem={addOnToAdjust}
          warningText={"❗❗❗ Zatwierdzenie spowoduje usunięcie dodatku."}
        />
      )}
    </div>,
    portalRoot
  );
}

export default SelectAddOnsPopup;
