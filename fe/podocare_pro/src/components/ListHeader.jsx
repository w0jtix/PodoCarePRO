import React from "react";

const ListHeader = ({ attributes, module }) => {
  return (
    <div className={`list-header ${module}`}>
      {attributes.map((attr, index) => (
        <h2
        key={index}
        className={`attribute-item  ${module}`}
        style={{
          width: attr.width,
          justifyContent: attr.justify,
          ...(attr.size ? { fontSize: attr.size } : {}),
        }}
      >
          {attr.name}
        </h2>
      ))}
    </div>
  );
};

export default ListHeader;
