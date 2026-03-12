import SubMenuNavbar from "../SubMenuNavbar";
import UserMenu from "../UserMenu";
import { SubModuleType } from "../../constants/modules";
import { SubMenuItem } from "../../constants/modules";

export interface ModulesNavigationBarProps {
  setModuleVisible: (module: SubModuleType) => void;
  submenuItems: SubMenuItem[];
  activeModule?: SubModuleType;
}

export function ModulesNavigationBar ({ setModuleVisible, submenuItems, activeModule }: ModulesNavigationBarProps) {
  return (
    <div className="orders-navigation-bar height-fit-content flex justify-center relative width-93">
      <section className="navigation-bar-interior flex align-items-center space-between width-93 height-fit-content m-0-auto">
        <SubMenuNavbar
          setModuleVisible={setModuleVisible}
          submenuItems={submenuItems}
          activeModule={activeModule}
          />
        <UserMenu />
      </section>
    </div>
  );
};

export default ModulesNavigationBar;
