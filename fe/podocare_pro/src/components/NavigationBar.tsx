import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import ListActionSection from "./ListActionSection";
import { ProductFilterDTO } from "../models/product";
import { useCallback } from "react";

export interface NavigationBarProps {
  onKeywordChange: (keyword: string) => void;
  resetTriggered: boolean;
  className?: string;
  children?: React.ReactNode;
}

const NavigationBar = ({
  onKeywordChange,
  resetTriggered,
  className = "",
  children,
}: NavigationBarProps) => {
  return (
    <div className={`navigation-bar ${className} height-fit-content block justify-center relative width-93`}>
      <section className="navigation-bar-interior flex align-items-center space-between width-93 height-fit-content m-0-auto">
        <SearchBar
          onKeywordChange={onKeywordChange}
          resetTriggered={resetTriggered}
        />
        {children}
        <UserMenu />
      </section>
    </div>
  );
};

export default NavigationBar;
