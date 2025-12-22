package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Review;
import com.podocare.PodoCareWebsite.model.constants.ReviewSource;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDTO {
    private Long id;
    private ClientDTO client;
    private Boolean isUsed;
    private ReviewSource source;
    private LocalDate issueDate;

    public ReviewDTO (Review review){
        this.id = review.getId();
        this.client = new ClientDTO(review.getClient());
        this.isUsed = review.getIsUsed();
        this.source = review.getSource();
        this.issueDate = review.getIssueDate();
    }

    public Review toEntity() {
        return Review.builder()
                .id(this.id)
                .client(this.client != null ? this.client.toEntity() : null)
                .isUsed(this.isUsed != null ? this.isUsed : false)
                .source(this.source)
                .issueDate(this.issueDate)
                .build();
    }
}
