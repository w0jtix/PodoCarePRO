import React, { useCallback } from "react";
import ActionButton from "../ActionButton";
import { ListAttribute} from "../../constants/list-headers";
import { Employee } from "../../models/employee";
import { User } from "../../models/login";
import { AVAILABLE_AVATARS } from "../../constants/avatars";

export interface EmployeeListProps {
  attributes: ListAttribute[];
  items: Employee[];
  users?: User[];
  setEditEmployeeId?: (employeeId: number | null) => void;
  className?: string;
  onClick?: (employee: Employee) => void;
}

export function EmployeeList({
  attributes,
  items,
  users = [],
  setEditEmployeeId,
  className = "",
  onClick,
}: EmployeeListProps) {

  const findUserByEmployeeId = (employeeId: number): User | undefined => {
    return users.find((user) => user.employee?.id === employeeId);
  };

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: Employee) => {
      e.stopPropagation();
      setEditEmployeeId?.(item.id);
    },
    [setEditEmployeeId]
  );



  const renderAttributeContent = (
    attr: ListAttribute,
    item: Employee,
    index: number,
  ): React.ReactNode => {
    switch (attr.name) {

        case " ":
        return ` `;

      case "Imię Nazwisko":
        return <span className="qv-span">{item.name + " " + item.secondName}</span>;

        case "Użytkownik":
          const user = findUserByEmployeeId(item.id);
          return user ? (
            <div className="emp-user flex g-05 align-items-center">
              <div className="single-user-avatar emp-list flex align-items-center">
                <img src={AVAILABLE_AVATARS[user.avatar || 0]} alt={user.username} />
              </div>
              <span className="qv-span">{user.username}</span>
            </div>
          ) : <span className="qv-span italic f10 ml-1">Nie przypisano</span>;

      case "Opcje":
        return ( 
<div className="item-list-single-item-action-buttons flex ml-1">
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Rabat"
              iconTitle={"Edytuj Rabat"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
          </div>   
        );
    }
};
  return (
    <div
      className={`item-list width-93 grid p-0 mt-05 ${
        items.length === 0 ? "border-none" : ""
      } ${className} `}
      
    >
      {items.map((item, index) => (
        <div key={item.id} className={`product-wrapper ${className}`}>
          <div
            className={`item align-items-center flex ${className} `}
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
export default EmployeeList;
