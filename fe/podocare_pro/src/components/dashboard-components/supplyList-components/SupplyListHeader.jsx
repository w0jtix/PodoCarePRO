import React from 'react'

const SupplyListHeader = ( { attributes }) => {

    

  return (
    <div className="supply-list-header">
      {attributes.map((attr, index) => (
        <h2 key={index} className="attribute-item"
        style={{
            width: attr.width,
            justifyContent: attr.justify
        }}>
            {attr.name}
        </h2>
      ))}
    </div>
  )
}

export default SupplyListHeader
