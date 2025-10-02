import ReactDOM from "react-dom";
import { User } from "../../models/login";
import { AVAILABLE_AVATARS } from "../../constants/avatars";
import { useState } from "react";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import AuthService from "../../services/AuthService";
import { validateForceChangePasswordForm } from "../../utils/validators";
import ActionButton from "../ActionButton";
import { Role } from "../../models/login";
import { validateUpdateUser } from "../../utils/validators";
import UserService from "../../services/UserService";

export interface EditUserPopupProps {
  onClose: () => void;
  className?: string;
  selectedUser: User | null;
  availableRoles: Role[];
  refreshUserList: () => void;
}

export function EditUserPopup({
  onClose,
  className = "",
  selectedUser,
  availableRoles,
  refreshUserList,
}: EditUserPopupProps) {
  const { showAlert } = useAlert();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showForceChangePw, setShowForceChangePw] = useState<boolean>(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(selectedUser);

  const handleShowForceChangePw = () => {
    setShowForceChangePw(prev => !prev);
  }

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

  const handleValidateUpdatedUser = () => {
    if (!updatedUser) {
      showAlert("Brak danych użytkownika do aktualizacji!", AlertType.ERROR);
      return;
    }

    const error = validateUpdateUser(updatedUser, selectedUser);
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

    AuthService.forceChangePassword(selectedUser!.id, newPassword)
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
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay ${className}`} onClick={onClose}>
      <div
        className="force-change-pw-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="f-c-pw-user-detials">
          <img
            className="popup-pfp"
            src={AVAILABLE_AVATARS[selectedUser!.avatar]}
            alt={selectedUser!.username}
          />
          <h2 className="h2-username">{selectedUser!.username}</h2>
          <button className="popup-close-button" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </div>
        <div className="user-roles-container popup">
                      <h2 className="pw-header role popup">Role Użytkownika:</h2>
                      <div className="user-roles-popup">
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
              className={`pw-change-button fc-pw ${showForceChangePw ? "visible" : ""}`}
            />
        {showForceChangePw && (
          <>
            <div className="popup-pw-inputs">
              <div className="pw-input-group">
                <p className="pw-label">Nowe Hasło:</p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="pw-input"
                />
              </div>

              <div className="pw-input-group">
                <p className="pw-label">Potwierdź Hasło:</p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pw-input"
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
