package com.podocare.PodoCareWebsite.DTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BonusVisitDTO {
    private Long visitId;
    private String clientName;
    private LocalDate date;
    private Double paymentsSum;
    private Double voucherPaymentsSum;
    private Double productsValue;
    private Double adjustedRevenue;
}
