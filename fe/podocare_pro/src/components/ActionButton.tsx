import React from "react";

export interface ActionButtonProps {
  src?: string;
  alt?: string;
  text?: string;
  onClick: (e: React.MouseEvent) => void;
  disableText?: boolean;
  disabled?: boolean;
}

export function ActionButton(props: ActionButtonProps) {
  return (
    <div className="product-action-button-container">
      <button className="product-action-button" onClick={props.onClick} disabled={props.disabled || false}>
        <img
          src={props.src}
          alt={props.alt}
          className={`product-action-button-icon ${props.text?.toLowerCase()}`}
        ></img>
        {!(props.disableText || false) && props.text && (
          <span className="product-action-button-text">{props.text}</span>
        )}
      </button>
    </div>
  );
};

export default ActionButton;
