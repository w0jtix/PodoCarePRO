package com.podocare.PodoCareWebsite.repo.projection;

import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;

import java.math.BigDecimal;

public interface CategoryExpenseProjection {
    ExpenseCategory getCategory();
    BigDecimal getTotalAmount();
}
