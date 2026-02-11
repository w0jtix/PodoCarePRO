import Navbar from "../components/Navbar";
import SettingsDashboard from "../components/Settings/SettingsDashboard";

const Settings = () => {
  return (
    <>
      <div className="container">
        <div className="display">
          <Navbar />
          <SettingsDashboard />
        </div>
      </div>
    </>
  );
};

export default Settings;
