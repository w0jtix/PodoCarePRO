import { useEffect } from "react";
import ReactDOM from "react-dom";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import EmployeeForm from "../Employee/EmployeeForm";
import closeIcon from "../../assets/close.svg";
import tickIcon from "../../assets/tick.svg";
import { NewEmployee, Employee, EmploymentType } from "../../models/employee";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { Action } from "../../models/action";
import EmployeeService from "../../services/EmployeeService";
import { validateEmployeeForm } from "../../utils/validators";


export interface EmployeePopupProps {
  onClose: () => void;
  employeeId?: number | null;
  className?: string;
}

export function EmployeePopup ({ 
  onClose, 
  employeeId,
  className= "" 
}: EmployeePopupProps) {
  const [fetchedEmployee, setFetchedEmployee] = useState<Employee | null>(null);
  const [employeeDTO, setEmployeeDTO] = useState<NewEmployee>({
    name: "",
    lastName: "",
    employmentType: EmploymentType.HALF,
    bonusPercent: 15,
    saleBonusPercent: 30,
  });
  const { showAlert } = useAlert();
  const action = employeeId ? Action.EDIT : Action.CREATE;

  const fetchEmployeeById = async(employeeId:number) => {
      EmployeeService.getEmployeeById(employeeId)
        .then((data) => {
          setFetchedEmployee(data);
          setEmployeeDTO(data);
        })
        .catch((error) => {
          console.error("Error fetching employee: ", error);
          showAlert("Błąd!", AlertType.ERROR);
        })
    }
  
    useEffect(() => {
      if (employeeId) {
        fetchEmployeeById(employeeId);
      }
    }, []);

  
  const handleEmployeeAction = useCallback(async () => {
    const error = validateEmployeeForm(employeeDTO,  fetchedEmployee, action);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      if (action === Action.CREATE) {
        await EmployeeService.createEmployee(employeeDTO as NewEmployee);
        showAlert(
          `Pracownik ${
            employeeDTO.name + " " + employeeDTO.lastName
          } utworzony!`,
          AlertType.SUCCESS
        );
      } else if (action === Action.EDIT && employeeId) {
        await EmployeeService.updateEmployee(
          employeeId,
          employeeDTO as NewEmployee
        );
        showAlert(`Pracownik zaktualizowany!`, AlertType.SUCCESS);
      }
      onClose();
    } catch (error) {
      showAlert(
        `Błąd ${
          action === Action.CREATE ? "tworzenia" : "aktualizacji"
        } pracownika!`,
        AlertType.ERROR
      );
    }
  }, [employeeDTO, showAlert, employeeId, action]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`}>
      <div
        className="add-employee-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="add-new-supplier-header flex">
          <h2 className="popup-title">{action === Action.CREATE ? "Nowy Pracownik 👩‍⚕️" : "Edytuj Pracownika"}</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src={closeIcon}
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <EmployeeForm
          employeeDTO={employeeDTO}
          setEmployeeDTO={setEmployeeDTO}
          className="emp"
          action={action}
        />
        <div className="popup-footer-container flex-column justify-end mt-25">
        <ActionButton
          src={tickIcon}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleEmployeeAction}
        />
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default EmployeePopup;
