import React from "react";

export interface ActionButtonProps {
  src?: string;
  alt?: string;
  text?: string;
  onClick: (e: React.MouseEvent) => void;
  disableImg?: boolean;
  disableText?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ActionButton(props: ActionButtonProps) {
  return (
    <div className={`product-action-button-container ${props.className? props.className : ""} flex align-items-center height-auto transparent`}>
      <button className={`product-action-button ${props.className? props.className : ""} transparent flex width-fit-content align-items-center justify-center g-5px pointer`} 
        onClick={props.onClick} 
        disabled={props.disabled || false}
      >
        { !props.disableImg && <img
          src={props.src}
          alt={props.alt}
          className={`product-action-button-icon ${props.text?.toLowerCase()} ${props.className? props.className : ""}`}
        ></img> }
        {!(props.disableText || false) && props.text && (
          <span className={`product-action-button-text ${props.className? props.className : ""}`}>{props.text}</span>
        )}
      </button>
    </div>
  );
};

export default ActionButton;
