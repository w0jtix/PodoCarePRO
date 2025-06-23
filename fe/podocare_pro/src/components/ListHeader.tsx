import React from "react";
import { ListAttribute } from "../constants/list-headers";

export enum ListModule {
  POPUP = "popup",
  ORDER = "order",
  HANDY = "handy",
}

export interface ListHeaderProps {
  attributes: ListAttribute[];
  module?: ListModule;
  className?: string;
}

export function ListHeader ({
  attributes, 
  module,
  className = ""
}: ListHeaderProps) {
  return (
    <div className={`list-header ${module?.toString()} ${className}`}>
      {attributes.map((attr, index) => (
        <h2
        key={index}
        className={`attribute-item  ${module?.toString()}`}
        style={{
          width: attr.width,
          justifyContent: attr.justify,
          ...(attr.size && { fontSize: attr.size }),
        }}
      >
          {attr.name}
        </h2>
      ))}
    </div>
  );
};

export default ListHeader;
