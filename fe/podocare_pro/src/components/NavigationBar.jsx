import React from 'react'
import SearchBar from './SearchBar'
import UserMenu from './UserMenu'
import ListActionSection from './ListActionSection'

const NavigationBar = ( { onFilter, productFilterDTO }) => {

  const handleFilterChange = (newKeyword) => {
    const updatedFilterDTO = {
      ...productFilterDTO,
      keyword: newKeyword
    }

    onFilter(updatedFilterDTO);
  }


  return (
    <div className="navigation-bar">
      <section className="navigation-bar-interior">
        <SearchBar onKeywordChange={handleFilterChange}/>
        <ListActionSection onFilter={onFilter} productFilterDTO={productFilterDTO}/>
        <UserMenu />
        </section>
    </div>
  )
}

export default NavigationBar
