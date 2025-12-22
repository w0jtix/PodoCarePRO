package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.ReviewDTO;
import com.podocare.PodoCareWebsite.DTO.VoucherDTO;
import com.podocare.PodoCareWebsite.DTO.request.ReviewFilterDTO;

import java.util.List;

public interface ReviewService {

    ReviewDTO getReviewById(Long id);

    List<ReviewDTO> getReviews(ReviewFilterDTO filter);

    ReviewDTO createReview(ReviewDTO review);

    ReviewDTO updateReview(Long id, ReviewDTO review);

    void deleteReviewById(Long id);
}
