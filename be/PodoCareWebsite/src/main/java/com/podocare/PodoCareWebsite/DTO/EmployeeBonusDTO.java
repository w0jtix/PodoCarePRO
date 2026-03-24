package com.podocare.PodoCareWebsite.DTO;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeBonusDTO {
    private Long employeeId;
    private String employeeName;
    private List<BonusVisitDTO> visits;
    private Double monthlyServicesRevenue;
    private Double bonusThreshold;
    private Double bonusPercent;
    private Double bonusAmount;

    private List<BonusProductDTO> products;
    private Double monthlyProductsRevenue;
    private Double saleBonusPercent;
    private Double productBonusAmount;
    private Double prevMonthSaleBonus;
    private Double twoMonthPrevSaleBonus;
    private Double boostCost;
}
