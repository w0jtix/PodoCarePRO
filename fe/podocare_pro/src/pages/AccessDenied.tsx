import Navbar from "../components/Navbar";

const AccessDenied = () => {
  return (
    <div className="container">
      <div className="display">
        <Navbar />
        <div className="dashboard-panel width-85 height-max flex justify-center align-items-center ">
          <div className="flex-column align-items-center g-1">
            <h1 className="access-denied-title">Brak dostępu</h1>
            <p className="access-denied-text">Nie masz uprawnień do wyświetlenia tej strony.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
