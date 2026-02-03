import ReactDOM from "react-dom";
import { useState, useCallback } from "react";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import SignupForm from "../User/SignupForm";
import AuthService from "../../services/AuthService";
import { RegisterRequest } from "../../models/register";
import { RoleType } from "../../models/login";
import { validateUserForm } from "../../utils/validators";

export interface UserPopupProps {
  onClose: () => void;
  className?: string;
}

export function UserPopup ({ 
  onClose, 
  className= "" 
}: UserPopupProps) {
  const [signupRequest, setSignupRequest] = useState<RegisterRequest>({
    username: "",
    password: "",
    role: [RoleType.ROLE_USER]
  });
  const { showAlert } = useAlert();
  
  const handleCreateUser= useCallback(async () => {
    const error = validateUserForm(signupRequest); 
    if(error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    AuthService.register(signupRequest.username, signupRequest.password, signupRequest.role)
    .then((data) => {
        showAlert("Użytkownik utworzony!", AlertType.SUCCESS);
        onClose();
    })
    .catch((error) => {
        console.error("Error while creating new User: ", error);
        showAlert("Błąd tworzenia nowego Użytkownika!", AlertType.ERROR);
    })
  }, [signupRequest, onClose]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={`add-popup-overlay flex justify-center align-items-start ${className}`} onClick={onClose}>
      <div
        className="add-user-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="add-new-supplier-header flex">
          <h2 className="popup-title">Nowy Użytkownik</h2>
          <button className="popup-close-button  transparent border-none flex align-items-center justify-center absolute pointer" onClick={onClose}>
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <SignupForm
            signupRequest={signupRequest}
            setSignupRequest={setSignupRequest}

        />
        <div className="popup-footer-container flex-column justify-end">
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleCreateUser}
        />
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default UserPopup;
