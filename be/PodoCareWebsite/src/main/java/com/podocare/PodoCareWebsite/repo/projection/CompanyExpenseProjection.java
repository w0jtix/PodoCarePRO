package com.podocare.PodoCareWebsite.repo.projection;

import java.math.BigDecimal;

public interface CompanyExpenseProjection {
    Integer getPeriod();
    BigDecimal getTotalExpense();
}
