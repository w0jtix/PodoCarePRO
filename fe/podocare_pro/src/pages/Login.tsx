import { useNavigate } from "react-router-dom";
import NavbarLogoContainer from "../components/NavbarLogoContainer";
import { useState } from "react";
import ActionButton from "../components/ActionButton";
import { AlertType } from "../models/alert";
import { validateLoginForm } from "../utils/validators";
import AuthService from "../services/AuthService";
import { useAlert } from "../components/Alert/AlertProvider";

const Login = () => {
  const { showAlert } = useAlert();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

    const handleLogin = async () => {
        const error = validateLoginForm(username, password);
        if (error) {
            showAlert(error, AlertType.ERROR);
            return null;
        }

        AuthService.login(username, password)
        .then((user) => {
            if(user) {
                showAlert(`Witaj ${user.username}!`, AlertType.SUCCESS);
                navigate("/");
            } else {
                showAlert("Nieprawidłowa nazwa użytkownika lub hasło", AlertType.ERROR);
                setPassword("");
            }
        })
        .catch(() => {
            showAlert("Wystąpił błąd podczas logowania", AlertType.ERROR);
            setPassword("");
        })
    }

  return (
    <div className="container">
      <div className="display">
        <div className="login-container">
          <NavbarLogoContainer />
          <div className="login-form-container">
            <div className="login-input-container">
              <p className="login-label">Nazwa użytkownika:</p>
              <input
                type="text"
                className="login-input"
                onChange={(value: React.ChangeEvent<HTMLInputElement>) => setUsername(value.target.value)}
                required={true}
                autoComplete="off"
              />
            </div>
            <div className="login-input-container">
              <p className="login-label">Hasło:</p>
              <input
                type="password"
                className="login-input"
                onChange={(value: React.ChangeEvent<HTMLInputElement>) => setPassword(value.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if(e.key === 'Enter') {
                    handleLogin();
                  }}
                }
                required={true}
                autoComplete="off"
              />
            </div>
          </div>
          <ActionButton
            text="Zaloguj"
            src={"src/assets/tick.svg"}
            alt={"Zaloguj"}
            onClick={handleLogin}
            className={"login-button"}
            />
        </div>
      </div>
    </div>
  );
};

export default Login;
