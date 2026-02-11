package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.ReviewDTO;
import com.podocare.PodoCareWebsite.DTO.ReviewDTO;
import com.podocare.PodoCareWebsite.DTO.ReviewDTO;
import com.podocare.PodoCareWebsite.DTO.request.ReviewFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Review;
import com.podocare.PodoCareWebsite.model.constants.ReviewSource;
import com.podocare.PodoCareWebsite.repo.ReviewRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepo reviewRepo;
    private final AuditLogService auditLogService;

    @Override
    public ReviewDTO getReviewById(Long id) {
        return new ReviewDTO(reviewRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with given id: " + id)));
    }

    @Override
    public List<ReviewDTO> getReviews(ReviewFilterDTO filter) {
        if(isNull(filter)) {
            filter = new ReviewFilterDTO();
        }

        return reviewRepo.findAllWithFilters(
                        filter.getKeyword(),
                        filter.getSource(),
                        filter.getIsUsed()
                )
                .stream()
                .map(ReviewDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReviewDTO createReview(ReviewDTO review) {
        try{
            if(review.getSource() == ReviewSource.GOOGLE) {
                markOtherReviewsAsUsed(review.getClient().getId());
            }

            ReviewDTO savedDTO = new ReviewDTO(reviewRepo.save(review.toEntity()));
            auditLogService.logCreate("Review", savedDTO.getId(),"Opinia Klienta: "+ savedDTO.getClient().getFirstName() + savedDTO.getClient().getLastName(), savedDTO);
            return savedDTO;
        } catch (Exception e) {
            throw new CreationException("Failed to create Review. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ReviewDTO updateReview(Long id, ReviewDTO review) {
        try{
            ReviewDTO oldReviewSnapshot = getReviewById(id);
            review.setId(id);
            ReviewDTO savedDTO = new ReviewDTO(reviewRepo.save(review.toEntity()));
            auditLogService.logUpdate("Review", id,"Opinia Klienta: "+ oldReviewSnapshot.getClient().getFirstName() + oldReviewSnapshot.getClient().getLastName(), oldReviewSnapshot, savedDTO);
            return savedDTO;
        } catch (Exception e) {
            throw new UpdateException("Failed to update Review. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteReviewById(Long id) {
        try{
            ReviewDTO reviewSnapshot = getReviewById(id);
            reviewRepo.deleteById(id);
            auditLogService.logDelete("Review", id,"Opinia Klienta: "+ reviewSnapshot.getClient().getFirstName() + reviewSnapshot.getClient().getLastName(), reviewSnapshot);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Review. Reason: "+ e.getMessage(), e);
        }
    }

    private void markOtherReviewsAsUsed(Long clientId) {
        List<Review> clientReviews = reviewRepo.findAllByClientId(clientId);
        List<Review> activeGoogleReviews = clientReviews.stream()
                .filter(r -> r.getSource() == ReviewSource.GOOGLE)
                .filter(r -> !r.getIsUsed())
                .collect(Collectors.toList());
        if(!activeGoogleReviews.isEmpty()) {
            for(Review rev : activeGoogleReviews) {
                rev.setIsUsed(true);
                reviewRepo.save(rev);
            }
        }
    }
}
