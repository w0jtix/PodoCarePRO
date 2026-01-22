import { Review, NewReview, ReviewFilterDTO } from "../models/review";

import { sendApiRequest } from "../components/send-api-request/SendApiRequest";

class ReviewService {
  static async getReviews(filter: ReviewFilterDTO): Promise<Review[]> {
    return await sendApiRequest<Review[]>(`reviews/search`, {
      method: "post",
      body: filter ?? {},
      errorMessage: "Error fetching Reviews.",
    });
  }

  static async getReviewById(
    id: string | number,
  ): Promise<Review> {
    return await sendApiRequest<Review>(`reviews/${id}`, {
        method: "get",
        body: {},
        errorMessage: `Error fetching Review with given id: ${id}`
    });;
  }

  static async createReview(
    review: NewReview
  ): Promise<Review> {
    return await sendApiRequest<Review>("reviews", {
      method: "post",
      body: review,
      errorMessage: "Error creating new Review.",
    });
  }

  static async updateReview(
    id: string | number,
    review: NewReview
  ): Promise<Review | undefined> {
    return await sendApiRequest<Review>(`reviews/${id}`, {
      method: "put",
      body: review,
      errorMessage: "Error updating Review.",
    });
  }

  static async deleteReview(
    id: string | number,
  ): Promise<void> {
    return await sendApiRequest<void>(`reviews/${id}`, {
        method: "delete",
        body: {},
        errorMessage: `Error removing Review with given id: ${id}`
    });
  }

  
}

export default ReviewService;
