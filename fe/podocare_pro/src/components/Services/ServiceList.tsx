import React, { useCallback, useEffect } from "react";
import ActionButton from "../ActionButton";
import { useState } from "react";
import { ListAttribute } from "../../constants/list-headers";
import { BaseService } from "../../models/service";

export interface ServiceListProps {
  attributes: ListAttribute[];
  items: BaseService[];
  setIsEditServicePopupOpen: (isOpen: boolean) => void;
  setIsRemoveServicePopupOpen: (isOpen: boolean) => void;
  setSelectedService: (service: BaseService | null) => void;
  className?: string;
}

export function ServiceList({
  attributes,
  items,
  setIsEditServicePopupOpen,
  setIsRemoveServicePopupOpen,
  setSelectedService,
  className = "",
}: ServiceListProps) {
  const [expandedServicesIds, setExpandedServicesIds] = useState<number[]>([]);

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: BaseService) => {
      e.stopPropagation();
      setSelectedService(item);
      setIsEditServicePopupOpen(true);
    },
    [setSelectedService, setIsEditServicePopupOpen]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: BaseService) => {
      e.stopPropagation();
      setSelectedService(item);
      setIsRemoveServicePopupOpen(true);
    },
    [setSelectedService, setIsRemoveServicePopupOpen]
  );

  const toggleServices = (serviceId: number) => {
    setExpandedServicesIds((prevIds) =>
      prevIds.includes(serviceId)
        ? prevIds.filter((id) => id !== serviceId)
        : [...prevIds, serviceId]
    );
  };

  const renderAttributeContent = (
    attr: ListAttribute,
    item: BaseService
  ): React.ReactNode => {
    switch (attr.name) {

      case "":
        return (
          <div
          className="badge"
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

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Usługę"
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
            <ActionButton
              src="src/assets/cancel.svg"
              alt="Usuń Usługę"
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
      className={`item-list ${
        items.length === 0 ? "is-empty" : ""
      } ${className}`}
      
    >
      {items.map((item) => (
        <div key={item.id} className={`product-wrapper ${className}`}>
          <div
            className={`item pointer ${className}`}
            onClick={() => toggleServices(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleServices(item.id);
              }
            }}
          >
            {attributes.map((attr) => (
              <div
                key={`${item.id}-${attr.name}`}
                className={`attribute-item  ${className}`}
                style={{
                  width: attr.width,
                  justifyContent: attr.justify,
                }}
              >
                {renderAttributeContent(attr, item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServiceList;
