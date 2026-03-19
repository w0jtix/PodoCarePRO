import React, { useCallback, useState} from "react";
import ActionButton from "../ActionButton";
import { ListAttribute } from "../../constants/list-headers";
import { Review, ReviewSource } from "../../models/review";
import VisitPopup from "../Popups/VisitPopup";
import { useUser } from "../User/UserProvider";
import { RoleType } from "../../models/login";
import removedIcon from "../../assets/removed.svg";
import editIcon from "../../assets/edit.svg";
import cancelIcon from "../../assets/cancel.svg";

export interface ReviewsListProps {
  attributes: ListAttribute[];
  items: Review[];
  setEditReviewId?: (reviewId: number | string) => void;
  setRemoveReviewId?: (reviewId: number | string) => void;
  className?: string;
  onClick?: (review: Review) => void;
}

export function ReviewsList({
  attributes,
  items,
  setEditReviewId,
  setRemoveReviewId,
  className = "",
}: ReviewsListProps) {
  const [selectedReviewIdForVisit, setSelectedReviewIdForVisit] = useState<string | number | null>(null);
  const { user } = useUser();

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: Review) => {
      e.stopPropagation();
      setEditReviewId?.(item.id);
    },
    [setEditReviewId ]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: Review) => {
      e.stopPropagation();
      setRemoveReviewId?.(item.id);
    },
    [setRemoveReviewId]
  );

  const renderAttributeContent = (
    attr: ListAttribute,
    item: Review,
  ): React.ReactNode => {
    switch (attr.name) {
      case "Źródło":
        return (
          <img
            src={`/src/assets/${
              item.source.toLowerCase()}.png`}
            alt="Review Source"
            className={`client-form-icon review ${
              item.source.toLowerCase()}`}
          />
        );

      case "Status":
        return (
          <div
            onClick={item.isUsed === true ? () => setSelectedReviewIdForVisit(item.id) : undefined}
            className={item.isUsed === true ? 'pointer' : 'default'}
          >
          <span
            className={`debt-list-span ${item.source !== ReviewSource.GOOGLE ? "" :
              item.isUsed === false ? "active" : "used"
            }`}
          >
            {item.source !== ReviewSource.GOOGLE ? "" : item.isUsed === false ? "AKTYWNA" : "ZREALIZOWANA"}
          </span>
          </div>
        );

      case "Klient":
        return(
          <div className={`flex g-5px ${item.client.isDeleted ? "pointer" : ""}`} title={`${item.client.isDeleted ? "Klient usunięty" : ""}`}>
            
          <span className={`text-align-center ${item.client.isDeleted ? "client-removed" : ""}`}>{item.client.firstName + " " + item.client.lastName}</span>
          {item.client.isDeleted && <img src={removedIcon} alt="Client Removed" className="checkimg align-self-center"/>}
        </div>
      );

      case "Dodano":
        return new Date(item.issueDate).toLocaleDateString("pl-PL");

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            {item.isUsed === false && (item.createdBy === user?.id || user?.roles.includes(RoleType.ROLE_ADMIN)) && (
              <>
            <ActionButton
              src={editIcon}
              alt="Edytuj Opinię"
              iconTitle={"Edytuj Opinię"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
              <ActionButton
                src={cancelIcon}
                alt="Usuń Opinię"
                iconTitle={"Usuń Opinię"}
                text="Usuń"
                onClick={(e) => handleOnClickRemove(e, item)}
                disableText={true}
              />
              </>
            )}
          </div>
        );
    }
  };
  return (
    <>
      <div
        className={`item-list width-93 flex-column p-0 mt-05 ${
          items.length === 0 ? "border-none" : ""
        } ${className} `}
      >
        {items.map((item) => (
          <div key={item.id} className={`product-wrapper width-max ${className}`}>
            <div className={`item align-items-center flex ${className} `}>
              {attributes.map((attr) => (
                <div
                  key={`${item.id}-${attr.name}`}
                  className={`attribute-item flex  ${className}`}
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

      {selectedReviewIdForVisit !== null && (
        <VisitPopup
          onClose={() => setSelectedReviewIdForVisit(null)}
          reviewId={selectedReviewIdForVisit}
        />
      )}
    </>
  );
}
export default ReviewsList;
