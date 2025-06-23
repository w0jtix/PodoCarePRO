import React, { useEffect } from "react";
import SearchBar from "../SearchBar";
import UserMenu from "../UserMenu";
import ListActionSection from "../ListActionSection";
import { ProductFilterDTO } from "../../models/product";
import { useCallback } from "react";

export interface NavigationBarProps {
  onFilter: (filter: ProductFilterDTO) => void;
  filter: ProductFilterDTO;
  onReset: () => void;
  resetTriggered: boolean;
  className?: string;
}

const NavigationBar = ({
  onFilter,
  filter,
  onReset,
  resetTriggered,
  className = ""
}: NavigationBarProps) => {
  const handleFilterChange = useCallback((newKeyword: string) => {
    const updatedFilterDTO = {
      ...filter,
      keyword: newKeyword,
    };

    onFilter(updatedFilterDTO);
  }, [filter, onFilter]);

  return (
    <div className={`navigation-bar ${className}`}>
      <section className="navigation-bar-interior">
        <SearchBar
          onKeywordChange={(newKeyword) => handleFilterChange(newKeyword)}
          resetTriggered={resetTriggered}
        />
        <ListActionSection
          onFilter={onFilter}
          filter={filter}
          onReset={onReset}
          resetTriggered={resetTriggered}
        />
        <UserMenu />
      </section>
    </div>
  );
};

export default NavigationBar;
