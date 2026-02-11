import { useEffect, useState, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ActionButton from "../ActionButton";
import ReactDOM from "react-dom";
import ListHeader from "../ListHeader";
import { AlertType } from "../../models/alert";
import { EMPLOYEES_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { Employee } from "../../models/employee";
import { User } from "../../models/login";
import EmployeeService from "../../services/EmployeeService";
import UserService from "../../services/UserService";
import EmployeePopup from "./EmployeePopup";
import EmployeeList from "../Employee/EmployeeList";

export interface EmployeeManagePopupProps {
  onClose: () => void;
  className?: string;
}

export function EmployeeManagePopup({
  onClose,
  className = "",
}: EmployeeManagePopupProps) {
  const [isAddNewEmployeePopupOpen, setIsAddNewEmployeePopupOpen] =
    useState<boolean>(false);
  const [editEmployeeId, setEditEmployeeId] =
    useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const { showAlert } = useAlert();

  const fetchEmployees = async (): Promise<void> => {
    EmployeeService.getAllEmployees()
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        setEmployees([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Employees: ", error);
      });
  };

  const fetchUsers = async (): Promise<void> => {
    UserService.getAllUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        setUsers([]);
        console.error("Error fetching Users: ", error);
      });
  };

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
  }, [resetTriggered]);

  useEffect(() => {
    fetchEmployees();
    fetchUsers();
  }, []);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      onClick={onClose}
    >
      <div
        className="employee-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Zarządzaj Pracownikami</h2>
          <button
            className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="flex width-90 justify-end mb-1 g-2">
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowy Pracownik"}
            text={"Nowy Pracownik"}
            onClick={() => setIsAddNewEmployeePopupOpen(true)}
          />
        </section>
        <EmployeeList
            items={employees}
            users={users}
            attributes={EMPLOYEES_LIST_ATTRIBUTES}
            setEditEmployeeId={setEditEmployeeId}
            className="services emp"
        />
        <a className="popup-category-description flex justify-center width-max italic">
              W celu przypisania Pracownika do Użytkownika skorzystaj z zakładki Profil/ Wszyscy Użytkownicy.
            </a>
      </div>

      {isAddNewEmployeePopupOpen && (
        <EmployeePopup
          onClose={() => {
            setIsAddNewEmployeePopupOpen(false);
            fetchEmployees();
            setResetTriggered(!resetTriggered);
          }}
          className=""
        />
      )}
      {editEmployeeId != null && (
        <EmployeePopup
          onClose={() => {
            setEditEmployeeId(null);
            fetchEmployees();
            setResetTriggered(!resetTriggered);
          }}
          className=""
          employeeId={editEmployeeId}
        />
      )}
      
    </div>,
    portalRoot
  );
}

export default EmployeeManagePopup;
