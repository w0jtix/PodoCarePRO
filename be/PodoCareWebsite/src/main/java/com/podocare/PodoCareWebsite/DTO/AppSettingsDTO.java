package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.AppSettings;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppSettingsDTO {
    private Long id;
    private Integer voucherExpiryTime;
    private Integer visitAbsenceRate;
    private Integer visitVipRate;
    private Integer boostNetRate;
    private Integer googleReviewDiscount;
    private Integer booksyHappyHours;

    public AppSettingsDTO(AppSettings settings) {
        this.id = settings.getId();
        this.voucherExpiryTime = settings.getVoucherExpiryTime();
        this.visitAbsenceRate = settings.getVisitAbsenceRate();
        this.visitVipRate = settings.getVisitVipRate();
        this.boostNetRate = settings.getBoostNetRate();
        this.googleReviewDiscount = settings.getGoogleReviewDiscount();
        this.booksyHappyHours = settings.getBooksyHappyHours();
    }

    public AppSettings toEntity() {
        return AppSettings.builder()
                .id(this.id)
                .voucherExpiryTime(this.voucherExpiryTime)
                .visitAbsenceRate(this.visitAbsenceRate)
                .visitVipRate(this.visitVipRate)
                .boostNetRate(this.boostNetRate)
                .googleReviewDiscount(this.googleReviewDiscount)
                .booksyHappyHours(this.booksyHappyHours)
                .build();
    }
}
