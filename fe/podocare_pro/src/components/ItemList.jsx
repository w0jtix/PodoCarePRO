import React from 'react'

const ItemList = ({ attributes, items, currentPage, itemsPerPage }) => {

  const attributeMap = {
    "Nazwa": "productName",
    "Marka": "brand.brandName",
    "Stan Magazynowy": "currentSupply",
  };

  const categoryColors = {
    "Sale" : "rgb(0, 253, 0)",
    "Tool" : "rgb(253, 173, 0)",
    "Equipment" : "rgb(253, 0, 190)",
  }

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  return (
    <div className={`item-list ${items.length === 0 ? "is-empty" : ""}`}>
      {items.map((item, index) => (
        <div key={`${item.id}-${item.productName}`} className="item">
          {attributes.map((attr) => (
            <div
              key={`${item.id}-${attr.name}`}
              className={`attribute-item ${attr.name === "" ? "category-column" : ""}`}
              style={{
                width: attr.width,
                justifyContent: attr.justify
              }}
              >
                {attr.name === "#" ? startIndex + index + 1 : attr.name === "" ? (
                  <div className="category-container"
                  style={{
                    backgroundColor: categoryColors[item.category]
                  }}></div>
                ) : (
                  getNestedValue(item, attributeMap[attr.name])
                )}
              </div>
          ))}
          </div>
      ))}
      
    </div>
  )
}

export default ItemList
