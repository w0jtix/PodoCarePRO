import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Dashboard from "../components/Products/Dashboard";
import InventoryReportDashboard from "../components/Products/InventoryReportDashboard";
import Navbar from "../components/Navbar";
import { SubModuleType } from "../constants/modules";

const Warehouse = () => {
  const location = useLocation();
  const [moduleVisible, setModuleVisible] = useState<SubModuleType>("Products");

  useEffect(() => {
    const stateModule = (location.state as { module?: string })?.module;
    if (stateModule === "Products" || stateModule === "InventoryReport") {
      setModuleVisible(stateModule);
    }
  }, [location.state]);

  return (
    <>
      <div className="container">
        <div className="display">
          <Navbar />
          {moduleVisible === "Products" && <Dashboard />}
          {moduleVisible === "InventoryReport" && (
            <InventoryReportDashboard
              setModuleVisible={setModuleVisible}
              activeModule={moduleVisible}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Warehouse;
