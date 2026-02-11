package com.podocare.PodoCareWebsite.DTO.request;

import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CompanyExpenseFilterDTO {
    private List<ExpenseCategory> categories;
    private Integer month;
    private Integer year;
}
