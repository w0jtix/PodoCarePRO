import ReactDOM from "react-dom";
import { User } from "../../models/login";
import { AVAILABLE_AVATARS } from "../../constants/avatars";
import { useEffect, useState } from "react";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import AuthService from "../../services/AuthService";
import { validateForceChangePasswordForm } from "../../utils/validators";
import ActionButton from "../ActionButton";
import { Role } from "../../models/login";
import { validateUpdateUser } from "../../utils/validators";
import UserService from "../../services/UserService";
import DropdownSelect from "../DropdownSelect";
import { Employee } from "../../models/employee";

export interface EditUserPopupProps {
  AddNewEmployeePopup: React.ComponentType<any>;
  handleAddNewEmployee: () => void;
  onClose: () => void;
  className?: string;
  userId: number | string | null;
  availableRoles: Role[];
  employees: Employee[];
  refreshUserList: () => void;
}

export function EditUserPopup({
  AddNewEmployeePopup,
  handleAddNewEmployee,
  onClose,
  className = "",
  userId,
  availableRoles,
  employees,
  refreshUserList,
}: EditUserPopupProps) {
  const { showAlert } = useAlert();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showForceChangePw, setShowForceChangePw] = useState<boolean>(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
   const [fetchedUser, setFetchedUser] = useState<User | null>(null);

  const handleShowForceChangePw = () => {
    setShowForceChangePw((prev) => !prev);
  };

  const fetchUserById = async (userId: number | string) => {
    UserService.getUserById(userId)
      .then((data) => {
        setUpdatedUser(data);
        setFetchedUser(data);
      })
      .catch((error) => {
        console.error("Error fetching user: ", error);
        showAlert("Błąd!", AlertType.ERROR)
      })
  }

  useEffect(() => {
    if(userId !== null) {
      fetchUserById(userId);
    }
  }, [])

  const toggleRole = (role: Role) => {
    setUpdatedUser((prev) => {
      if (!prev) return prev;
      const hasRole = prev.roles.some((r) => r.id === role.id);
      return {
        ...prev,
        roles: hasRole
          ? prev.roles.filter((r) => r.id !== role.id)
          : [...prev.roles, role],
      };
    });
  };

  const handleEmployeeSelect = (value: Employee | Employee[] | null) => {
    setUpdatedUser((prev) => {
      if (!prev) return prev;

      const selectedEmployee = Array.isArray(value) ? value[0] : value;

      return {
        ...prev,
        employee: selectedEmployee,
      };
    });
  };

  const handleValidateUpdatedUser = () => {
    if (!updatedUser) {
      showAlert("Brak danych użytkownika do aktualizacji!", AlertType.ERROR);
      return;
    }

    const error = validateUpdateUser(updatedUser, fetchedUser);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }

    handleEditUser();
  };

  const handleEditUser = async () => {
    if (!updatedUser) return;

    try {
      const data = await UserService.updateUser(updatedUser.id, updatedUser);

      if (!data) {
        showAlert("Błąd aktualizacji - brak danych!", AlertType.ERROR);
        return;
      }

      refreshUserList();
      onClose();
      showAlert(
        `Użytkownik ${updatedUser.username} zaktualizowany!`,
        AlertType.SUCCESS
      );
    } catch (error) {
      showAlert("Błąd aktualizacji!", AlertType.ERROR);
    }
  };

  const handleForceChangePassword = async () => {
    const error = validateForceChangePasswordForm(newPassword, confirmPassword);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }

    if (!fetchedUser) {
      showAlert("Błąd - brak danych użytkownika!", AlertType.ERROR);
      return;
    }

    AuthService.forceChangePassword(fetchedUser.id, newPassword)
      .then((message) => {
        if (message === "Password changed successfully") {
          showAlert("Hasło zostało pomyślnie zmienione!", AlertType.SUCCESS);
          setNewPassword("");
          setConfirmPassword("");
          onClose();
        }
      })
      .catch(() => {
        showAlert("Wystąpił błąd podczas zmiany hasła!", AlertType.ERROR);
        setNewPassword("");
        setConfirmPassword("");
      });
  };

  

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  if (!fetchedUser) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`} onClick={onClose}>
      <div
        className="force-change-pw-content flex-column align-items-center relative g-15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="f-c-pw-user-detials flex g-1 align-items-center align-self-start">
          <img
            className="popup-pfp"
            src={AVAILABLE_AVATARS[fetchedUser.avatar]}
            alt={fetchedUser.username}
          />
          <h2 className="h2-username text-align-center">{fetchedUser.username}</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </div>
        <div className="user-roles-container flex-column g-05 align-items-center popup">
          <h2 className="pw-header text-align-center m-0">Role Użytkownika:</h2>
          <div className="user-roles-popup flex g-1">
            {availableRoles.map((role) => (
              <ActionButton
                text={role.name.replace("ROLE_", "")}
                disableImg={true}
                onClick={() => toggleRole(role)}
                className={`role-button ${
                  updatedUser?.roles.some((r) => r.id === role.id)
                    ? "selected"
                    : ""
                }`}
                key={role.id}
              />
            ))}
          </div>
        </div>
        <div className="asign-employee-container flex align-self-start align-items-center width-60 mt-1 space-between">
          <h2 className="pw-header text-align-center m-0">Pracownik:</h2>
          <DropdownSelect
            items={employees}
            onChange={handleEmployeeSelect}
            value={updatedUser?.employee}
            placeholder="NIE WYBRANO"
            multiple={false}
            showNewPopup={true}
            newItemComponent={AddNewEmployeePopup as React.ComponentType<any>}
            newItemProps={{
              onAddNew: handleAddNewEmployee,
            }}
          />
        </div>
        <ActionButton
          text={"Zapisz Zmiany"}
          src={"src/assets/tick.svg"}
          onClick={handleValidateUpdatedUser}
          className="user-update-button popup"
        />
        <ActionButton
          text="Dodatkowe Opcje"
          src={"src/assets/arrow_down.svg"}
          alt={"Wymuś zmianę hasła"}
          onClick={handleShowForceChangePw}
          className={`pw-change-button fc-pw ${
            showForceChangePw ? "visible" : ""
          }`}
        />
        {showForceChangePw && (
          <>
            <div className="popup-pw-inputs width-60 mt-1 mb-1 ml-0 mr-0 flex-column g-1">
              <div className="pw-input-group flex space-between align-items-center">
                <p className="pw-label">Nowe Hasło:</p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pw-input text-align-left"
                />
              </div>

              <div className="pw-input-group flex space-between align-items-center">
                <p className="pw-label">Potwierdź Hasło:</p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pw-input text-align-left"
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      handleForceChangePassword();
                    }
                  }}
                />
              </div>
            </div>
            <ActionButton
              text="Zmień Hasło"
              src={"src/assets/tick.svg"}
              alt={"Zmień Hasło"}
              onClick={handleForceChangePassword}
              className={"pw-change-button"}
            />
          </>
        )}
      </div>
    </div>,
    portalRoot
  );
}

export default EditUserPopup;
