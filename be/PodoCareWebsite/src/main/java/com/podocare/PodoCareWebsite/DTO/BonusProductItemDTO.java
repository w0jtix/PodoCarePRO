package com.podocare.PodoCareWebsite.DTO;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BonusProductItemDTO {
    private LocalDate saleDate;
    private Double avgPurchaseNetPrice;
    private Double avgPurchaseGrossPrice;
    private Double saleNetPrice;
    private Double saleGrossPrice;
    private Double margin;
    private Double bonusPerUnit;
}
