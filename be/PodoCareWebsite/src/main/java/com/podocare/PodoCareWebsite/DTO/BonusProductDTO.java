package com.podocare.PodoCareWebsite.DTO;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BonusProductDTO {
    private Long productId;
    private String productName;
    private String brandName;
    private Integer quantitySold;
    private Double totalBonus;
    private Boolean noPurchaseHistory;
    private List<BonusProductItemDTO> items;
}
