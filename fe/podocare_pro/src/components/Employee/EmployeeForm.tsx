
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
    <div className={`supplier-form-container flex-column ${className}`}>
      <section className="employee-form-core-section mt-25">
        <ul className="supplier-form-inputs-section width-95 flex-column p-0 mt-0 mb-0 align-self-center g-2">
          <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15  name">
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
          <li className="popup-common-section-row flex align-items-center space-between g-10px mt-15  name">
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
