package com.podocare.PodoCareWebsite.repo.projection;

import java.math.BigDecimal;

public interface EmployeeRevenueProjection {
    Long getEmployeeId();
    String getEmployeeName();
    Integer getPeriod(); // month (1-12) or day (1-31)
    BigDecimal getRevenue();
}
