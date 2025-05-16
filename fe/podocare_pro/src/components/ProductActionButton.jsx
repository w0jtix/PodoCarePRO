import React from "react";

const ProductActionButton = ({ src, alt, text, onClick, disableText, disabled = false }) => {
  return (
    <div className="product-action-button-container">
      <button className="product-action-button" onClick={onClick} disabled={disabled}>
        <img
          src={src}
          alt={alt}
          className={`product-action-button-icon ${text?.toLowerCase()}`}
        ></img>
        {!disableText ? (
          <a className="product-action-button-a">{text}</a>
        ) : null}
      </button>
    </div>
  );
};

export default ProductActionButton;
