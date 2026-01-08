import React, { useCallback, useEffect } from "react";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { ListAttribute} from "../../constants/list-headers";
import { BaseService } from "../../models/service";

export interface ServiceListProps {
  attributes: ListAttribute[];
  items: BaseService[];
  setRemoveServiceId?: (serviceId: number | null) => void;
  setEditServiceId?: (serviceId: number | null) => void;
  className?: string;
  onClick?: (service: BaseService) => void;
}

export function ServiceList({
  attributes,
  items,
  setRemoveServiceId,
  setEditServiceId,
  className = "",
  onClick
}: ServiceListProps) {
  const [expandedServicesIds, setExpandedServicesIds] = useState<number[]>([]);

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: BaseService) => {
      e.stopPropagation();
      setEditServiceId?.(item.id);
    },
    [setEditServiceId]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: BaseService) => {
      e.stopPropagation();
      setRemoveServiceId?.(item.id);
    },
    [setRemoveServiceId]
  );

  const toggleServices = (serviceId: number, service: BaseService) => {
    setExpandedServicesIds((prevIds) =>
      prevIds.includes(serviceId)
        ? prevIds.filter((id) => id !== serviceId)
        : [...prevIds, serviceId]
    );
    onClick?.(service);
  };


  const renderAttributeContent = (
    attr: ListAttribute,
    item: BaseService,
    index?: number,
  ): React.ReactNode => {
    switch (attr.name) {

      case "":
        return (
          <div
          className="badge p-0 height-max"
          style={{
            backgroundColor: item.category?.color
                      ? `rgb(${item.category.color})`
                      : undefined
          }}
          />
        );

      case "Kategoria":
        return `${item.category.name}`;

      case "Nazwa":
        return `${item.name}`;

      case "Czas":
        return `${item.duration} min`;

      case "Cena":
        return `${item.price} zł`;

      case "Koszt" :
        return `${item.price} zł`;

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Usługę"
              iconTitle={"Edytuj Usługę"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
            <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Usługę"
              iconTitle={"Usuń Usługę"}
              text="Usuń"
              onClick={(e) => handleOnClickRemove(e, item)}
              disableText={true}
            />
          </div>
        );
      default:
        return <span>{"-"}</span>;
    }
  };

  return (
    <div
      className={`item-list width-max grid p-0 ${
        items.length === 0 ? "border-none" : ""
      } ${className}`}
      
    >
      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} className={`product-wrapper ${className}`}>
          <div
            className={`item align-items-center pointer flex ${className}`}
            onClick={() => toggleServices(item.id, item)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleServices(item.id, item);
              }
            }}
          >
            {attributes.map((attr) => (
              <div
                key={`${item.id}-${attr.name}`}
                className={`attribute-item flex  ${className}`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, item, index)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServiceList;
