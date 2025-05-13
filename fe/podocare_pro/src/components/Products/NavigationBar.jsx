import React, { useEffect } from "react";
import SearchBar from "../SearchBar";
import UserMenu from "../UserMenu";
import ListActionSection from "../ListActionSection";

const NavigationBar = ({
  onFilter,
  filters,
  handleResetFiltersAndData,
  resetTriggered,
}) => {
  const handleFilterChange = (newKeyword) => {
    const updatedFilterDTO = {
      ...filters,
      keyword: newKeyword,
    };

    onFilter(updatedFilterDTO);
  };

  useEffect(() => {}, [filters]);

  return (
    <div className="navigation-bar">
      <section className="navigation-bar-interior">
        <SearchBar
          onKeywordChange={(newKeyword) => handleFilterChange(newKeyword)}
          resetTriggered={resetTriggered}
        />
        <ListActionSection
          onFilter={onFilter}
          filters={filters}
          handleResetFiltersAndData={handleResetFiltersAndData}
          resetTriggered={resetTriggered}
        />
        <UserMenu />
      </section>
    </div>
  );
};

export default NavigationBar;
