package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.VisitDiscount;
import com.podocare.PodoCareWebsite.model.constants.VisitDiscountType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VisitDiscountDTO {
    private Long id;
    private VisitDiscountType type;
    private Integer percentageValue;
    private String name;
    private Long clientDiscountId;
    private Long reviewId;
    private Long voucherId;


    public VisitDiscountDTO (VisitDiscount visitDiscount) {
        this.id = visitDiscount.getId();
        this.type = visitDiscount.getType();
        this.percentageValue = visitDiscount.getPercentageValue();
        this.name = visitDiscount.getName();
        this.clientDiscountId = visitDiscount.getClientDiscountId();
        this.reviewId = visitDiscount.getReviewId();
    }

    public VisitDiscount toEntity() {
        return VisitDiscount.builder()
                .id(this.id)
                .type(this.type)
                .percentageValue(this.percentageValue)
                .name(this.name)
                .clientDiscountId(this.clientDiscountId)
                .reviewId(this.reviewId)
                .build();
    }
}
