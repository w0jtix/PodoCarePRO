import Navbar from "../components/Navbar";
import ActionButton from "../components/ActionButton";
import { useNavigate } from "react-router-dom";
import homepageIcon from "../assets/homepage.svg";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="display">
        <Navbar />
        <div className="dashboard-panel width-85 height-max flex justify-center align-items-center ">
          <div className="flex-column align-items-center g-1">
            <h1 className="access-denied-title">Strona nie istnieje</h1>
            <ActionButton
              src={homepageIcon}
              alt="Strona główna"
              text="Strona główna"
              onClick={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
