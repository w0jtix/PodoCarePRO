package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.CompanyExpenseDTO;
import com.podocare.PodoCareWebsite.DTO.request.CompanyExpenseFilterDTO;
import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import org.springframework.data.domain.Page;

import java.util.Optional;

public interface CompanyExpenseService {

    CompanyExpenseDTO getExpenseById(Long id);

    Optional<CompanyExpenseDTO> getLatestExpenseByCategory(ExpenseCategory category);

    Page<CompanyExpenseDTO> getExpenses(CompanyExpenseFilterDTO filter, int page, int size);

    CompanyExpenseDTO getExpensePreview(CompanyExpenseDTO expenseDTO);

    CompanyExpenseDTO createExpense(CompanyExpenseDTO expenseDTO);

    CompanyExpenseDTO updateExpense(Long id, CompanyExpenseDTO expenseDTO);

    void deleteExpenseById(Long id);
}
