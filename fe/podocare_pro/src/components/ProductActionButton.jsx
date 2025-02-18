import React from 'react'

const ProductActionButton = ({ src, alt, text,  func }) => {
  return (
    <div className="product-action-button-container">
        <button className="product-action-button">
        <img 
        src={src}
        alt={alt} 
        className={`product-action-button-icon`} 
        ></img>
        <a className="product-action-button-a">
            {text}
        </a>
        </button>
      
    </div>
  )
}

export default ProductActionButton
