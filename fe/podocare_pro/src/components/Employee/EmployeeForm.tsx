
import TextInput from "../TextInput";
import React, { useState, useEffect, useCallback } from "react";
import { Employee, EmploymentType, NewEmployee } from "../../models/employee";
import { Action } from "../../models/action";
import { Slider } from "../Slider";
import DropdownSelect from "../DropdownSelect";

export interface EmployeeFormProps {
  employeeDTO: NewEmployee;
  setEmployeeDTO: React.Dispatch<React.SetStateAction<NewEmployee>>;
  className?: string;
  action: Action;
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  [EmploymentType.QUARTER]: "1/4 etatu",
  [EmploymentType.HALF]: "1/2 etatu",
  [EmploymentType.THREE_QUARTERS]: "3/4 etatu",
  [EmploymentType.FULL]: "Pełny etat",
};

const employmentTypeOptions = Object.values(EmploymentType).map((type) => ({
  id: type,
  name: employmentTypeLabels[type],
}));

export function EmployeeForm ({
  employeeDTO,
  setEmployeeDTO,
  className="",
  action,
 }: EmployeeFormProps) {



  const handleEmployeeName = useCallback((name: string) => {
    setEmployeeDTO((prev) => ({
      ...prev,
      name,
    }));
  }, []);
  const handleSecondName = useCallback((secondName: string) => {
    setEmployeeDTO((prev) => ({
      ...prev,
      secondName: secondName || "",
    }));
  }, []);
  const handleEmploymentTypeChange = useCallback((selected: { id: string; name: string } | { id: string; name: string }[] | null) => {
    const selectedItem = Array.isArray(selected) ? selected[0] : selected;
    setEmployeeDTO((prev) => ({
      ...prev,
      employmentType: (selectedItem?.id as EmploymentType) || EmploymentType.HALF,
    }));
  }, []);
  const handleBonusChange = useCallback((bonusPercent: number) => {
    setEmployeeDTO((prev) => ({
      ...prev,
      bonusPercent,
    }));
  }, []);
  const handleSaleBonusChange = useCallback((saleBonusPercent: number) => {
    setEmployeeDTO((prev) => ({
      ...prev,
      saleBonusPercent,
    }));
  }, []);


  return (
    <div className={`supplier-form-container flex-column ${className}`}>
      <section className="employee-form-core-section mt-25">
        <ul className="supplier-form-inputs-section width-95 flex-column p-0 mt-0 mb-0 align-self-center g-2">
          <li className="popup-common-section-row flex align-items-center space-between g-10px name">
            <a className="supplier-form-input-title">Imię:</a>
            <TextInput
              dropdown={false}
              value={employeeDTO.name}
              onSelect={(inputName) => {
                if (typeof inputName === "string") {
                  handleEmployeeName(inputName);
                }
              }}
              className="invoice"
            />
          </li>
          <li className="popup-common-section-row flex align-items-center space-between g-10px name">
            <a className="supplier-form-input-title">Nazwisko:</a>
            <TextInput
              dropdown={false}
              value={employeeDTO.secondName}
              placeholder=""
              onSelect={(secondName) => {
                if (typeof secondName === "string") {
                  handleSecondName(secondName);
                }
              }}
              className="invoice"
            />
          </li>
          <li className="popup-common-section-row flex align-items-center space-between g-10px name">
            <a className="supplier-form-input-title">Etat:</a>
            <DropdownSelect
              items={employmentTypeOptions}
              placeholder="Wymiar etatu"
              value={employmentTypeOptions.find((opt) => opt.id === employeeDTO.employmentType) || null}
              allowNew={false}
              onChange={handleEmploymentTypeChange}
            />
          </li>
          <li className="popup-common-section-row flex align-items-center justify-center g-10px name">
            <Slider
                        onChange={handleBonusChange}
                        min={0}
                        max={100}
                        step={1}
                        unit={" %"}
                        value={employeeDTO.bonusPercent || 0}
                        label={"Premia utarg:"}
                        className=""
                      />
          </li>
          <li className="popup-common-section-row flex align-items-center justify-center g-10px name">
            <Slider
                        onChange={handleSaleBonusChange}
                        min={0}
                        max={100}
                        step={1}
                        unit={" %"}
                        value={employeeDTO.saleBonusPercent || 0}
                        label={"Premia sprzedaż:"}
                        className=""
                      />
          </li>
        </ul>
      </section>
    </div>
  );
};

export default EmployeeForm;
