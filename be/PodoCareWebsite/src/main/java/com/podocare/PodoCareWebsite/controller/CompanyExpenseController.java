package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.CompanyExpenseDTO;
import com.podocare.PodoCareWebsite.DTO.request.CompanyExpenseFilterDTO;
import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import com.podocare.PodoCareWebsite.service.CompanyExpenseService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/company-expenses")
public class CompanyExpenseController {
    private final CompanyExpenseService companyExpenseService;

    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CompanyExpenseDTO>> getExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestBody CompanyExpenseFilterDTO filter) {
        Page<CompanyExpenseDTO> expensesPage = companyExpenseService.getExpenses(filter, page, size);
        return new ResponseEntity<>(expensesPage, expensesPage.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyExpenseDTO> getExpenseById(@PathVariable(value = "id") Long id) {
        CompanyExpenseDTO expense = companyExpenseService.getExpenseById(id);
        return new ResponseEntity<>(expense, HttpStatus.OK);
    }

    @GetMapping("/latest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyExpenseDTO> getLatestExpenseByCategory(@RequestParam ExpenseCategory category) {
        return companyExpenseService.getLatestExpenseByCategory(category)
                .map(expense -> new ResponseEntity<>(expense, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NO_CONTENT));
    }

    @PostMapping("/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyExpenseDTO> getExpensePreview(@NonNull @RequestBody CompanyExpenseDTO expense) {
        CompanyExpenseDTO previewExpense = companyExpenseService.getExpensePreview(expense);
        return new ResponseEntity<>(previewExpense, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyExpenseDTO> createExpense(@NonNull @RequestBody CompanyExpenseDTO expense) {
        CompanyExpenseDTO newExpense = companyExpenseService.createExpense(expense);
        return new ResponseEntity<>(newExpense, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyExpenseDTO> updateExpense(@PathVariable(value = "id") Long id, @NonNull @RequestBody CompanyExpenseDTO expense) {
        CompanyExpenseDTO saved = companyExpenseService.updateExpense(id, expense);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExpense(@PathVariable(value = "id") Long id) {
        companyExpenseService.deleteExpenseById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
