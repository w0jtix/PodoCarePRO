import { BaseServiceAddOn } from "../../models/service";
import { useState, useEffect } from "react";
import BaseServiceAddOnService from "../../services/BaseServiceAddOnService";
import ActionButton from "../ActionButton";

import ReactDOM from "react-dom";
import { Action } from "../../models/action";
import AddOnPopup from "./AddOnPopup";

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
    const [addOnToAdjust, setAddOnToAdjust] = useState<BaseServiceAddOn | null> (null);
    const [isAddOnPopupOpen, setIsAddOnPopupOpen] = useState<boolean> (false);
  const [availableAddOns, setAvailableAddOns] = useState<BaseServiceAddOn[]>(
    []
  );

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

  useEffect(() => {
    fetchAddOns();
  }, []);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay ${className}`} onClick={onClose}>
      <div
        className="select-addons-popup-content"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="addons-popup-header">
          <h2 className="popup-title">{`${
            action === Action.SELECT ? "Wybierz Dodatki" : "Zarządzaj Dodatkami"
          }`}</h2>
          <button className="popup-close-button" onClick={onClose}>
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

        <section className={`addons-list ${action === Action.SELECT ? "select-mode" : ""}`}>
          {availableAddOns.map((addOn) => (
            <div
              key={addOn.id}
              className={`addon-item ${className} ${
                attachedAddOns?.some((a) => a.id === addOn.id) ? "selected" : ""
              }`}
              onClick={() => {
                if (action === Action.SELECT && handleSelectAddOns) {
                  handleSelectAddOns(addOn);
                }
              
              }}
            >
              <span className="addon-item-name">{addOn.name}</span>
              <span className="addon-item-duration">{addOn.duration}min</span>
              <span className="addon-item-price">{addOn.price}zł</span>
              {action === Action.MANAGE && (
                <>
                <ActionButton
                  src="src/assets/edit.svg"
                  alt="Edytuj Usługę"
                  text="Edytuj"
                  onClick={() => {
                    setAddOnToAdjust(addOn)
                    setIsAddOnPopupOpen(true)
                  }}
                  disableText={true}
                  className="addon-edit"
                />
                <ActionButton
                              src="src/assets/cancel.svg"
                              alt="Usuń Usługę"
                              text="Usuń"
                              onClick={() => {
                    setAddOnToAdjust(addOn)
                    setIsAddOnPopupOpen(true)
                  }}
                              disableText={true}
                              className="addon-edit"
                            />
                            </>
              )}
            </div>
          ))}
        </section>
        { action === Action.SELECT && (
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
                  setIsAddOnPopupOpen(false)
                  setAddOnToAdjust(null)
                }}
                selectedAddOn={addOnToAdjust}
            />
          )}
    </div>,
    portalRoot
  );
}

export default SelectAddOnsPopup;
