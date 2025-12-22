package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.VisitDiscountType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "visit_discount")
public class VisitDiscount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitDiscountType type;

    @Column
    private Integer percentageValue;

    @Column
    private String name;

    @Column
    private Long clientDiscountId;
    @Column
    private Long reviewId;

    @PrePersist
    @PreUpdate
    public void validate() {
        if( type == VisitDiscountType.CUSTOM) {
            if (percentageValue == null) {
                throw new IllegalStateException("Percentage value is required.");
            }
            if (percentageValue < 0 || percentageValue > 100) {
                throw new IllegalStateException("Percentage must be between 0 and 100");
            }
        }
        if (type == VisitDiscountType.CLIENT_DISCOUNT) {
            if (clientDiscountId == null) {
                throw new IllegalStateException("Discount is not assigned");
            }
            if (name == null || name.trim().isEmpty()) {
                throw new IllegalStateException("Name is required for CLIENT_DISCOUNT type");
            }
        }
        if (type == VisitDiscountType.GOOGLE_REVIEW && reviewId == null) {
            throw new IllegalStateException("Review is not assigned");
        }
    }
}
