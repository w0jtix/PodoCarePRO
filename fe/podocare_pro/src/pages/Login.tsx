import { useNavigate } from "react-router-dom";
import NavbarLogoContainer from "../components/NavbarLogoContainer";
import { useState } from "react";
import ActionButton from "../components/ActionButton";
import { AlertType } from "../models/alert";
import { validateLoginForm } from "../utils/validators";
import AuthService from "../services/AuthService";
import { useAlert } from "../components/Alert/AlertProvider";
import { useUser } from "../components/User/UserProvider";

const Login = () => {
  const { showAlert } = useAlert();
  const { setUser } = useUser();
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
                setUser(user);
                showAlert(`Witaj ${user.username}!`, AlertType.SUCCESS);
                navigate("/");
            }
        })
        .catch((error) => {
            showAlert("Wystąpił błąd podczas logowania", AlertType.ERROR);          
            setPassword("");
        })
    }

  return (
    <div className="container">
      <div className="display">
        <div className="login-container width-fit-content height-fit-content m-auto flex-column align-items-center">
          <NavbarLogoContainer />
          <div className="login-form-container align-self-center pb-2">
            <div className="flex align-items-center space-between width-max align-self-center">
              <p className="login-label">Nazwa użytkownika:</p>
              <input
                type="text"
                className="login-input text-align-left"
                value={username}
                onChange={(value: React.ChangeEvent<HTMLInputElement>) => setUsername(value.target.value)}
                required={true}
                autoComplete="off"
              />
            </div>
            <div className="flex align-items-center space-between width-max align-self-center">
              <p className="login-label">Hasło:</p>
              <input
                type="password"
                className="login-input text-align-left"
                value={password}
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
