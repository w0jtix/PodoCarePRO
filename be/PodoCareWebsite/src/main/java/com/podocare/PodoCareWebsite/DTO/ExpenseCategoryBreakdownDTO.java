package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExpenseCategoryBreakdownDTO {

    private ExpenseCategory category;
    private Double amount;
    private Double sharePercent;
}
