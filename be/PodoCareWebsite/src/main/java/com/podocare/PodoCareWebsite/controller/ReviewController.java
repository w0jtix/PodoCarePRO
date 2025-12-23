package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ReviewDTO;
import com.podocare.PodoCareWebsite.DTO.request.ReviewFilterDTO;
import com.podocare.PodoCareWebsite.service.ReviewService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<ReviewDTO>> getReviews(@RequestBody ReviewFilterDTO filter) {
        List<ReviewDTO> reviewDTOList = reviewService.getReviews(filter);
        return new ResponseEntity<>(reviewDTOList, reviewDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ReviewDTO> getReviewById(@PathVariable(value = "id") Long id){
        ReviewDTO review = reviewService.getReviewById(id);
        return new ResponseEntity<>(review, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ReviewDTO> createReview(@NonNull @RequestBody ReviewDTO review) {
        ReviewDTO newReview = reviewService.createReview(review);
        return new ResponseEntity<>(newReview, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable(value = "id") Long id, @NonNull @RequestBody ReviewDTO review){
        ReviewDTO saved = reviewService.updateReview(id, review);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteReview(@PathVariable(value = "id") Long id) {
        reviewService.deleteReviewById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
