import React, { useEffect } from 'react'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'
import ListActionSection from './ListActionSection'

const NavigationBar = ( { onFilter, productFilterDTO, handleResetAllFilters, resetTriggered }) => {

  const handleFilterChange = (newKeyword) => {
    const updatedFilterDTO = {
      ...productFilterDTO,
      keyword: newKeyword
    }

    onFilter(updatedFilterDTO);
  }

  useEffect(() => {

  },[productFilterDTO]);


  return (
    <div className="navigation-bar">
      <section className="navigation-bar-interior">
        <SearchBar 
        onKeywordChange={handleFilterChange}
        resetTriggered={resetTriggered}
        />
        <ListActionSection 
        onFilter={onFilter} 
        productFilterDTO={productFilterDTO}
        handleResetAllFilters={handleResetAllFilters}
        resetTriggered={resetTriggered}
        />
        <UserMenu />
        </section>
    </div>
  )
}

export default NavigationBar
