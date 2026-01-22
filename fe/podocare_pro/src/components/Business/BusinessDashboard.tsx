import ModulesNavigationBar from "../Orders/ModulesNavigationBar";
import { BUSINESS_SUBMENU_ITEMS, SubModuleType } from "../../constants/modules";
import { useState } from "react";
import ExpenseHistory from "./ExpenseHistory";
import EmployeesStats from "./EmployeesStats";
import BusinessSettings from "./BusinessSettings";

export function BusinessDashboard() {
    const [moduleVisible, setModuleVisible] = useState<SubModuleType>("Common");
    const submenuItems = BUSINESS_SUBMENU_ITEMS;


    return (
        <div className="dashboard-panel width-85 height-max flex-column align-items-center">
        <ModulesNavigationBar
            setModuleVisible={setModuleVisible} 
            submenuItems={submenuItems}
        />
        {moduleVisible === "Common" && <ExpenseHistory/>}
        {moduleVisible === "Employees" && <EmployeesStats/>}
        {moduleVisible === "Settings" && <BusinessSettings />}
        </div>
    );

}

export default BusinessDashboard;