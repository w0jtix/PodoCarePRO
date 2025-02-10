import React from 'react'
import BrandFilterButton from './BrandFilterButton'
import CategoryButtons from './CategoryButtons'

const ListActionSection = ( { onFilter, productFilterDTO }) => {

  const { productTypes, keyword } = productFilterDTO;
  const brandFilterDTO = { productTypes, keyword };

  return (
    <div className="list-action-section">     
      <CategoryButtons onFilter ={onFilter} productFilterDTO={productFilterDTO}/>
      <BrandFilterButton brandFilterDTO={brandFilterDTO} onSave={onFilter}/>
    </div>
  )
}

export default ListActionSection
