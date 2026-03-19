package com.podocare.PodoCareWebsite.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeRevenueSeriesDTO {

    private Long employeeId;
    private String employeeName;
    private List<BigDecimal> data;
}
