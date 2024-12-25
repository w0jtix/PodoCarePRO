import React from 'react'
import BrandFilterButton from './list-action-section-components/BrandFilterButton'
import CategoryButtons from './list-action-section-components/CategoryButtons'

const ListActionSection = ( { onFilter, productFilterDTO }) => {

  return (
    <div className="list-action-section">     
      <CategoryButtons onFilter ={onFilter} productFilterDTO={productFilterDTO}/>
      <BrandFilterButton productTypes={productFilterDTO.productTypes} onSave={onFilter}/>
    </div>
  )
}

export default ListActionSection
