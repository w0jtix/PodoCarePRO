import { Client } from "../../models/client";
import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import ActionButton from "../ActionButton";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { Action } from "../../models/action";
import { Review, NewReview } from "../../models/review";
import { validateReviewForm } from "../../utils/validators";
import ReviewService from "../../services/ReviewService";
import ReviewForm from "../Clients/ReviewForm";

export interface ReviewPopupProps {
  onClose: () => void;
  clients: Client[];
  reviewId?: number | string | null;
  className: string;
}

export function ReviewPopup({
  onClose,
  clients,
  reviewId,
  className = "",
}: ReviewPopupProps) {
  const [fetchedReview, setFetchedReview] = useState<Review | null>(null);
  const [reviewDTO, setReviewDTO] = useState<NewReview>({
    client: null,
    issueDate: new Date().toISOString().split("T")[0],
    source: null,
    isUsed: null
  });
  const { showAlert } = useAlert();

  const action = reviewId ? Action.EDIT : Action.CREATE;

  const fetchReviewById = async(reviewId:number | string) => {
    ReviewService.getReviewById(reviewId)
      .then((data) => {
        setFetchedReview(data);
        setReviewDTO(data);
      })
      .catch((error) => {
        console.error("Error fetching review: ", error);
        showAlert("Błąd!", AlertType.ERROR);
      })
  }

  const handleReviewAction = useCallback(async () => {
    const error = validateReviewForm(reviewDTO, action, fetchedReview);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      if (action === Action.CREATE) {
        await ReviewService.createReview(reviewDTO as NewReview);
        showAlert(
          `Opinia klienta ${
            reviewDTO.client?.firstName + " " + reviewDTO.client?.lastName
          } utworzona!`,
          AlertType.SUCCESS
        );
      } else if (action === Action.EDIT && reviewId) {
        await ReviewService.updateReview(
          reviewId,
          reviewDTO as NewReview
        );
        showAlert(`Opinia zaktualizowana!`, AlertType.SUCCESS);
      }
      onClose();
    } catch (error) {
      showAlert(
        `Błąd ${
          action === Action.CREATE ? "tworzenia" : "aktualizacji"
        } opinii!`,
        AlertType.ERROR
      );
    }
  }, [reviewDTO, showAlert, reviewId, action]);

  useEffect(() => {
    if (reviewId) {
      fetchReviewById(reviewId);
    }
  }, []);

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
        className="voucher-popup-content flex-column align-items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <section className="product-popup-header flex mb-2">
          <h2 className="popup-title">
            {action === Action.CREATE ? "Nowa Opinia" : "Edytuj Opinię"}
          </h2>
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
        <section className="custom-form-section width-90 mb-15">
          <ReviewForm
            reviewDTO={reviewDTO}
            setReviewDTO={setReviewDTO}
            clients={clients}
            action={action}
          />
        </section>

        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          onClick={handleReviewAction}
        />
      </div>
    </div>,
    portalRoot
  );
}

export default ReviewPopup;
