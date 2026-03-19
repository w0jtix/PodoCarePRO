import { useEffect, useState } from "react";
import { ListAttribute, SM_BREAKPOINT } from "../constants/list-headers";

export enum ListModule {
  POPUP = "popup",
  ORDER = "order",
  HANDY = "handy",
}

export interface ListHeaderProps {
  attributes: ListAttribute[];
  module?: ListModule;
  className?: string;
  customWidth?: string;
}

export function ListHeader ({
  attributes,
  module,
  className = "",
  customWidth = "",
}: ListHeaderProps) {
  const [isSmall, setIsSmall] = useState(window.innerWidth < SM_BREAKPOINT);

  useEffect(() => {
    const handler = () => setIsSmall(window.innerWidth < SM_BREAKPOINT);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className={`list-header flex ${customWidth.length >0 ? customWidth : "width-max"} ${module?.toString()} ${className}`}>
      {attributes.map((attr, index) => (
        <h2
          key={index}
          className={`attribute-item flex ${module?.toString()}`}
          style={{
            width: (isSmall && attr.widthSm) ? attr.widthSm : attr.width,
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
