
import TextInput from "../TextInput";
import { useState, useEffect, useCallback } from "react";
import { Employee, NewEmployee } from "../../models/employee";

export interface EmployeeFormProps {
  onForwardEmployeeForm: (employee: Employee | NewEmployee) => void;
  selectedEmployee?: Employee | null;
  className?: string;
}

export function EmployeeForm ({ 
  onForwardEmployeeForm, 
  selectedEmployee,
  className=""
 }: EmployeeFormProps) {

  const getInitialData = (): Employee | NewEmployee => {
    if (selectedEmployee) {
      return {
        id: selectedEmployee.id,
        name: selectedEmployee.name,
        secondName: selectedEmployee.secondName
      };
    }
    return {
      name: "",
      secondName: ""
    };
  };
  const [employeeData, setEmployeeData] = useState<Employee | NewEmployee>(getInitialData);

  useEffect(() => {
    setEmployeeData(getInitialData());
  }, [selectedEmployee]);

  useEffect(() => {
    onForwardEmployeeForm(employeeData);
  }, [employeeData]);

  const handleEmployeeName = useCallback((name: string) => {
    setEmployeeData((prev) => ({
      ...prev,
      name,
    }));
  }, []);

  const handleSecondName = useCallback((secondName: string) => {
    setEmployeeData((prev) => ({
      ...prev,
      secondName: secondName || "",
    }));
  }, []);

  const getName = (): string => {
    return 'name' in employeeData ? employeeData.name || "" : "";
  };

  const getSecondName = (): string => {
    return employeeData.secondName || "";
  };

  return (
    <div className={`supplier-form-container ${className}`}>
      <section className="employee-form-core-section">
        <ul className="supplier-form-inputs-section">
          <li className="popup-common-section-row name">
            <a className="supplier-form-input-title">Imię:</a>
            <TextInput
              dropdown={false}
              value={getName()}
              onSelect={(inputName) => {
                if (typeof inputName === "string") {
                  handleEmployeeName(inputName);
                }
              }}
            />
          </li>
          <li className="popup-common-section-row name">
            <a className="supplier-form-input-title">Nazwisko:</a>
            <TextInput
              dropdown={false}
              value={getSecondName()}
              placeholder=""
              onSelect={(secondName) => {
                if (typeof secondName === "string") {
                  handleSecondName(secondName);
                }
              }}
            />
          </li>
        </ul>
      </section>
    </div>
  );
};

export default EmployeeForm;
