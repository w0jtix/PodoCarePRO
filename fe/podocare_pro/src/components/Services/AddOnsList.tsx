import { BaseServiceAddOn, NewBaseServiceAddOn } from "../../models/service";
import { useState, useEffect, useCallback } from "react";
import BaseServiceAddOnService from "../../services/BaseServiceAddOnService";
import ActionButton from "../ActionButton";
import AvailableAddOnsPopup from "../Popups/AvailableAddOnsPopup";
import { Action } from "../../models/action";

export interface AddOnsListProps {
  className: string;
  addOns: BaseServiceAddOn[];
  onAddOnsChange:(addOns: BaseServiceAddOn[]) => void;
}

export function AddOnsList({ className = "", addOns, onAddOnsChange }: AddOnsListProps) {
  const [isAddOnPopupOpen, setIsAddOnPopupOpen] = useState<boolean>(false);
  const [tempAddOns, setTempAddOns] = useState<BaseServiceAddOn[]>(addOns);

  useEffect(() => {
    if (isAddOnPopupOpen) {
      setTempAddOns(addOns);
    }
  }, [isAddOnPopupOpen, addOns]);

  const handleToggleAddOn = useCallback((selected: BaseServiceAddOn) => {
    setTempAddOns((prev) =>
      prev.some((a) => a.id === selected.id)
        ? prev.filter((a) => a.id !== selected.id)
        : [...prev, selected]
    );
  }, []);

  const handleSaveAddOns = useCallback(() => {
    onAddOnsChange(tempAddOns);
    setIsAddOnPopupOpen(false);
  }, [tempAddOns, onAddOnsChange]);

  return (
    <div className="addons-container flex-column width-max">
      <div className="addons-list-header flex space-between g-2 align-items-center">
        <div className="addons-title-count flex align-items-center g-1">
          <img src="src/assets/star.svg" alt="Dodatki" className="dodatki-icon"></img>
          <span className="addons-title">Dodatki:</span>
          <span className="addons-title">{addOns.length}</span>
        </div>
        <ActionButton
          src={"src/assets/manage.svg"}
          alt={"Zarządzaj"}
          text={"Zarządzaj"}
          onClick={() => setIsAddOnPopupOpen(true)}
          className="manage-addons"
        />
      </div>
      <section className="addons-list flex-column g-05 width-max  service">
        {addOns.map((addOn, index) => (
          <div key={index} className="addon-item width-max flex align-items-center">
            <span className="addon-item-name width-75 ml-1">{addOn.name}</span>
            <span className="addon-item-duration text-align-center">{addOn.duration}min</span>
            <span className="addon-item-price text-align-center">{addOn.price}zł</span>
          </div>
        ))}
      </section>
      {isAddOnPopupOpen && (
        <AvailableAddOnsPopup
          action={Action.SELECT}
          onClose={() => setIsAddOnPopupOpen(false)}
          handleSelectAddOns={handleToggleAddOn}
          onSave={handleSaveAddOns}
          attachedAddOns={tempAddOns}
          className="select-addons"
        />
      )}
    </div>
  );
}

export default AddOnsList;
