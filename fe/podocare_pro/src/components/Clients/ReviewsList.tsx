import React, { useCallback, useState} from "react";
import ActionButton from "../ActionButton";
import { ListAttribute } from "../../constants/list-headers";
import { Review, ReviewSource } from "../../models/review";
import VisitPopup from "../Popups/VisitPopup";

export interface ReviewsListProps {
  attributes: ListAttribute[];
  items: Review[];
  setIsEditReviewPopupOpen?: (isOpen: boolean) => void;
  setIsRemoveReviewPopupOpen?: (isOpen: boolean) => void;
  setSelectedReview?: (review: Review | null) => void;
  className?: string;
  onClick?: (review: Review) => void;
}

export function ReviewsList({
  attributes,
  items,
  setIsEditReviewPopupOpen,
  setIsRemoveReviewPopupOpen,
  setSelectedReview,
  className = "",
  onClick,
}: ReviewsListProps) {
  const [selectedReviewIdForVisit, setSelectedReviewIdForVisit] = useState<string | number | null>(null);

  const handleOnClickEdit = useCallback(
    (e: React.MouseEvent, item: Review) => {
      e.stopPropagation();
      setSelectedReview?.(item);
      setIsEditReviewPopupOpen?.(true);
    },
    [setSelectedReview, setIsEditReviewPopupOpen]
  );

  const handleOnClickRemove = useCallback(
    (e: React.MouseEvent, item: Review) => {
      e.stopPropagation();
      setSelectedReview?.(item);
      setIsRemoveReviewPopupOpen?.(true);
    },
    [setSelectedReview, setIsRemoveReviewPopupOpen]
  );

  const renderAttributeContent = (
    attr: ListAttribute,
    item: Review,
    index: number
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
        return `${item.client.firstName + " " + item.client.lastName}`;

      case "Dodano":
        return new Date(item.issueDate).toLocaleDateString("pl-PL");

      case "Opcje":
        return (
          <div className="item-list-single-item-action-buttons flex">
            {item.isUsed === false && (
              <>
            <ActionButton
              src="src/assets/edit.svg"
              alt="Edytuj Opinię"
              iconTitle={"Edytuj Opinię"}
              text="Edytuj"
              onClick={(e) => handleOnClickEdit(e, item)}
              disableText={true}
            />
              <ActionButton
                src="src/assets/cancel.svg"
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
        className={`item-list width-93 grid p-0 mt-05 ${
          items.length === 0 ? "border-none" : ""
        } ${className} `}
      >
        {items.map((item, index) => (
          <div key={item.id} className={`product-wrapper ${className}`}>
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
                  {renderAttributeContent(attr, item, index)}
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
