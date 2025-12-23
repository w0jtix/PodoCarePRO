import { useEffect, useState, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ActionButton from "../ActionButton";
import ReactDOM from "react-dom";
import ListHeader from "../ListHeader";
import { Client } from "../../models/client";
import RemovePopup from "./RemovePopup";
import { AlertType } from "../../models/alert";
import SearchBar from "../SearchBar";
import { Review, ReviewFilterDTO, ReviewSource } from "../../models/review";
import ReviewService from "../../services/ReviewService";
import { REVIEWS_LIST_ATTRIBUTES } from "../../constants/list-headers";
import ReviewsList from "../Clients/ReviewsList";
import ReviewPopup from "./ReviewPopup";

export interface ReviewManagePopupProps {
  onClose: () => void;
  onReset: () => void;
  clients: Client[];
  className?: string;
}

export function ReviewManagePopup({
  onClose,
  onReset,
  clients,
  className = "",
}: ReviewManagePopupProps) {
  const [isAddNewReviewPopupOpen, setIsAddNewReviewPopupOpen] =
    useState<boolean>(false);
  const [editReviewId, setEditReviewId] =
    useState<number | string | null>(null);
  const [removeReviewId, setRemoveReviewId] =
    useState<number | string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<ReviewFilterDTO>({
    source: null,
    keyword: "",
    isUsed: null
  });
  const { showAlert } = useAlert();

  const fetchReviews = async (): Promise<void> => {
    ReviewService.getReviews(filter)
      .then((data) => {
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.issueDate);
          const dateB = new Date(b.issueDate);
          return dateB.getTime() - dateA.getTime();
        });
        setReviews(sortedData);
      })
      .catch((error) => {
        setReviews([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching reviews: ", error);
      });
  };

  const handleKeywordChange = useCallback((newKeyword: string) => {
    setFilter((prev) => ({
      ...prev,
      keyword: newKeyword,
    }));
  }, []);

  const handleReviewSourceChange = useCallback((source: ReviewSource) => {
    setFilter((prev) => ({
      ...prev,
      source: prev.source === source ? null : source,
    }));
  }, []);

  const handleReviewRemove = useCallback(async (): Promise<void> => {
    try {
      if (removeReviewId) {
        await ReviewService.deleteReview(removeReviewId);
        showAlert("Pomyślnie usunięto opinię!", AlertType.SUCCESS);
        setRemoveReviewId(null);
        fetchReviews();
        onReset();
      }
    } catch (error) {
      showAlert("Błąd usuwania opinii!", AlertType.ERROR);
    }
  }, [removeReviewId]);

  const toggleStatus = () => {
    setFilter((prev) => {
        let nextStatus: Boolean | null = null;
    if (prev.isUsed === null) nextStatus = false;
    else if (prev.isUsed === false) nextStatus = true;
    else nextStatus = null;

    return { ...prev, isUsed: nextStatus };
  });
  };

  useEffect(() => {
    fetchReviews();
 }, []);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) {
    showAlert("Błąd", AlertType.ERROR);
    console.error("Portal root element not found");
    return null;
  }
  return ReactDOM.createPortal(
    <div
      className={`add-popup-overlay flex justify-center align-items-start ${className}`}
      onClick={onClose}
    >
      <div
        className="debt-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-1">
          <h2 className="popup-title">Zarządzaj Opiniami</h2>
          <button
            className="popup-close-button transparent border-none flex align-items-center justify-center absolute pointer"
            onClick={onClose}
          >
            <img
              src="src/assets/close.svg"
              alt="close"
              className="popup-close-icon"
            />
          </button>
        </section>
        <section className="flex width-90 space-between mb-1 g-2">
          <div className="flex g-2"> 
          <ActionButton
            src={"src/assets/filter_icon.svg"}
            alt={"Status"}
            text={`Status: ${
              filter.isUsed === null
                ? "wszystkie"
                : filter.isUsed === false
                ? "aktywne"
                : "zrealizowane"
            }`}
            onClick={toggleStatus}
            className={`${
              filter.isUsed === null
                ? "wszystkie"
                : filter.isUsed === false
                ? "active"
                : "expired"
            }`}
          />          
          {Object.values(ReviewSource).map((source) => (
                      <ActionButton
                        key={source}
                        src={`src/assets/${source.toLowerCase()}.png`}
                        alt={source}
                        disableText={true}
                        onClick={() => handleReviewSourceChange(source)}
                        className={`filter-review-source ${source.toLowerCase()} ${filter.source === source ? "selected" : ""}`}
                      />
                    ))}
          <SearchBar
            onKeywordChange={handleKeywordChange}
          />  
          </div>
          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowa Opinia"}
            text={"Nowa Opinia"}
            onClick={() => setIsAddNewReviewPopupOpen(true)}
          />
        </section>
        <ListHeader attributes={REVIEWS_LIST_ATTRIBUTES} />
        <ReviewsList
          attributes={REVIEWS_LIST_ATTRIBUTES}
          items={reviews}
          className="products popup-list"
          setEditReviewId={setEditReviewId}
          setRemoveReviewId={setRemoveReviewId}
        />
      </div>

      {isAddNewReviewPopupOpen && (
        <ReviewPopup
          onClose={() => {
            setIsAddNewReviewPopupOpen(false);
            fetchReviews();
            onReset();
          }}
          clients={clients}
          className=""
        />
      )}
      {editReviewId != null && (
        <ReviewPopup
          onClose={() => {
            setEditReviewId(null);
            fetchReviews();
            onReset();
          }}
          clients={clients}
          className=""
          reviewId={editReviewId}
        />
      )}
      {removeReviewId != null && (
        <RemovePopup
          onClose={() => {
            setRemoveReviewId(null);
          }}
          className=""
          handleRemove={handleReviewRemove}
          warningText={
            "Zatwierdzenie spowoduje usunięcie Opinii z bazy danych!"
          }
        />
      )}
    </div>,
    portalRoot
  );
}

export default ReviewManagePopup;
