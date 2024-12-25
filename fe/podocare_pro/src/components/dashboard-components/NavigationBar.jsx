import React from 'react'
import SearchBar from './navigationBar-components/SearchBar'
import UserMenu from './navigationBar-components/UserMenu'
import ListActionSection from './navigationBar-components/ListActionSection'

const NavigationBar = ( { onFilter, productFilterDTO }) => {
  return (
    <div className="navigation-bar">
        <SearchBar onFilter={onFilter} productFilterDTO={productFilterDTO}/>
        <ListActionSection onFilter={onFilter} productFilterDTO={productFilterDTO}/>
        <UserMenu />
    </div>
  )
}

export default NavigationBar
