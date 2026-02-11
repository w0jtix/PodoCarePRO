package com.podocare.PodoCareWebsite.DTO;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyRevenueDTO {

    private List<BigDecimal> revenueData;
    private List<BigDecimal> expensesData;
    private List<BigDecimal> incomeData;
}
