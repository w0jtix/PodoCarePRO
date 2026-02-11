package com.podocare.PodoCareWebsite.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeStatsDTO {

    private Long id;
    private String name;
    private String avatar;

    private Double hoursWithClients;
    private Double availableHours;

    private Double servicesRevenue;
    private Double productsRevenue;
    private Double totalRevenue;

    private Double servicesRevenueGoal;
    private Double productsRevenueGoal;
    private Double totalRevenueGoal;


    private Integer servicesDone;
    private Integer productsSold;
    private Integer vouchersSold;

    private Integer newClients;
    private Double clientsSecondVisitConversion;
    private Integer newBoostClients;
    private Double boostClientsSecondVisitConversion;

    private String topSellingServiceName;
    private String topSellingProductName;
}
