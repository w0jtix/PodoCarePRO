import ModulesNavigationBar from "../Orders/ModulesNavigationBar";
import { BUSINESS_SUBMENU_ITEMS, SubModuleType } from "../../constants/modules";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ExpenseHistory from "./ExpenseHistory";
import EmployeesStats from "./EmployeesStats";
import BusinessSettings from "./BusinessSettings";
import { CompanyStatistics } from "./CompanyStatistics";

export function BusinessDashboard() {
    const location = useLocation();
    const [moduleVisible, setModuleVisible] = useState<SubModuleType>("Expenses");
    const submenuItems = BUSINESS_SUBMENU_ITEMS;

    useEffect(() => {
      const stateModule = (location.state as { module?: string })?.module;
      if (stateModule === "Expenses" || stateModule === "Employees" || stateModule === "Statistics" || stateModule === "CompanySettings") {
        setModuleVisible(stateModule);
      }
    }, [location.state]);


    return (
        <div className="dashboard-panel width-85 height-max flex-column align-items-center">
        <ModulesNavigationBar
            setModuleVisible={setModuleVisible}
            submenuItems={submenuItems}
            activeModule={moduleVisible}
        />
        {moduleVisible === "Expenses" && <ExpenseHistory/>}
        {moduleVisible === "Employees" && <EmployeesStats/>}
        {moduleVisible === "Statistics" && <CompanyStatistics />}
        {moduleVisible === "CompanySettings" && <BusinessSettings />}
        </div>
    );

}

export default BusinessDashboard;