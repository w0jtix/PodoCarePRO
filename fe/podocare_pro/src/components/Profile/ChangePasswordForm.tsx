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
    <div className="password-container">
      <h2 className="pw-header">Zmiana Hasła</h2>
      <div className="pw-inputs-container">
      <div className="pw-input-group">
        <p className="pw-label">Stare Hasło:</p>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className="pw-input"
        />
      </div>

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
