import React from 'react'
import CategoryButtons from './CategoryButtons'
import BrandButton from './BrandButton'

const ListActionSection = ( { onFilter, productFilterDTO }) => {

  const { productTypes, keyword } = productFilterDTO;
  const brandFilterDTO = { productTypes, keyword };

  return (
    <div className="list-action-section">     
      <CategoryButtons onFilter ={onFilter} productFilterDTO={productFilterDTO}/>
      <BrandButton brandFilterDTO={brandFilterDTO} onSelect={onFilter} />
    </div>
  )
}

export default ListActionSection
