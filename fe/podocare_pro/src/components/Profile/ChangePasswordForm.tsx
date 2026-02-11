import { useState } from "react";
import { AlertType } from "../../models/alert";
import { useAlert } from "../Alert/AlertProvider";
import { validateChangePasswordForm } from "../../utils/validators";
import ActionButton from "../ActionButton";
import AuthService from "../../services/AuthService";

export function ChangePasswordForm() {
  const { showAlert } = useAlert();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    const error = validateChangePasswordForm(
      oldPassword,
      newPassword,
      confirmPassword
    );
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    AuthService.changePassword(oldPassword, newPassword)
        .then((message) => {
            if(message === "Old password doesn't match") {
                showAlert("Nieprawidłowe stare hasło", AlertType.ERROR);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else if(message ==="Password changed successfully") {
                showAlert("Hasło zostało pomyślnie zmienione", AlertType.SUCCESS);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        })
        .catch(() => {
            showAlert("Wystąpił błąd podczas zmiany hasła", AlertType.ERROR);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        })
  };

  return (
    <div className="password-container flex-column g-2">
      <h2 className="pw-header text-align-center">Zmiana Hasła</h2>
      <div className="pw-inputs-container flex-column g-1">
      <div className="pw-input-group flex space-between align-items-center">
        <p className="pw-label">Stare Hasło:</p>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className="pw-input text-align-left"
        />
      </div>

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
              handleSubmit();
            }
          }}
        />
      </div>
      </div>

        <ActionButton
                    text="Zmień Hasło"
                    src={"src/assets/tick.svg"}
                    alt={"Zmień Hasło"}
                    onClick={handleSubmit}
                    className={"pw-change-button"}
                    />
    </div>
  );
}
