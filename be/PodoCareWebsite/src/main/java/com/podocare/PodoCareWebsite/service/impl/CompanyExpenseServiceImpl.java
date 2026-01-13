package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.CompanyExpenseDTO;
import com.podocare.PodoCareWebsite.DTO.CompanyExpenseItemDTO;
import com.podocare.PodoCareWebsite.DTO.request.CompanyExpenseFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.CompanyExpense;
import com.podocare.PodoCareWebsite.model.CompanyExpenseItem;
import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import com.podocare.PodoCareWebsite.repo.CompanyExpenseItemRepo;
import com.podocare.PodoCareWebsite.repo.CompanyExpenseRepo;
import com.podocare.PodoCareWebsite.service.CompanyExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class CompanyExpenseServiceImpl implements CompanyExpenseService {

    private final CompanyExpenseRepo companyExpenseRepo;
    private final CompanyExpenseItemRepo companyExpenseItemRepo;

    @Override
    public CompanyExpenseDTO getExpenseById(Long id) {
        return new CompanyExpenseDTO(companyExpenseRepo.findOneByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company expense not found with id: " + id)));
    }

    @Override
    public Optional<CompanyExpenseDTO> getLatestExpenseByCategory(ExpenseCategory category) {
        return companyExpenseRepo.findFirstByCategoryOrderByExpenseDateDesc(category)
                .map(CompanyExpenseDTO::new);
    }

    @Override
    public Page<CompanyExpenseDTO> getExpenses(CompanyExpenseFilterDTO filter, int page, int size) {
        if (isNull(filter)) {
            filter = new CompanyExpenseFilterDTO();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("expenseDate"), Sort.Order.desc("id")));

        LocalDate dateFrom;
        LocalDate dateTo;

        if (filter.getYear() != null && filter.getMonth() != null) {
            YearMonth yearMonth = YearMonth.of(filter.getYear(), filter.getMonth());
            dateFrom = yearMonth.atDay(1);
            dateTo = yearMonth.atEndOfMonth();
        } else if (filter.getYear() != null) {
            YearMonth currentMonth = YearMonth.of(filter.getYear(), LocalDate.now().getMonthValue());
            dateFrom = currentMonth.atDay(1);
            dateTo = currentMonth.atEndOfMonth();
        } else {
            YearMonth now = YearMonth.now();
            dateFrom = now.atDay(1);
            dateTo = now.atEndOfMonth();
        }

        Page<CompanyExpense> expenses = companyExpenseRepo.findAllWithFilters(
                filter.getCategories(),
                dateFrom,
                dateTo,
                pageable);
        return expenses.map(CompanyExpenseDTO::new);
    }

    @Override
    public CompanyExpenseDTO getExpensePreview(CompanyExpenseDTO expenseDTO) {
        CompanyExpense tempExpense = convertDtoToEntity(expenseDTO);
        tempExpense.calculateTotals();

        expenseDTO.setTotalValue(tempExpense.getTotalValue());
        expenseDTO.setTotalNet(tempExpense.getTotalNet());
        expenseDTO.setTotalVat(tempExpense.getTotalVat());

        return expenseDTO;
    }

    @Override
    @Transactional
    public CompanyExpenseDTO createExpense(CompanyExpenseDTO expenseDTO) {
        try {
            CompanyExpense expense = CompanyExpense.builder()
                    .source(expenseDTO.getSource())
                    .expenseDate(expenseDTO.getExpenseDate())
                    .invoiceNumber(expenseDTO.getInvoiceNumber())
                    .category(expenseDTO.getCategory())
                    .build();

            for (CompanyExpenseItemDTO itemDTO : expenseDTO.getExpenseItems()) {
                CompanyExpenseItem item = CompanyExpenseItem.builder()
                        .companyExpense(expense)
                        .name(itemDTO.getName())
                        .quantity(itemDTO.getQuantity())
                        .vatRate(itemDTO.getVatRate())
                        .price(itemDTO.getPrice())
                        .build();
                expense.addExpenseItem(item);
            }

            expense.calculateTotals();

            CompanyExpense savedExpense = companyExpenseRepo.save(expense);
            return new CompanyExpenseDTO(savedExpense);
        } catch (Exception e) {
            throw new CreationException("Failed to create company expense. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public CompanyExpenseDTO updateExpense(Long id, CompanyExpenseDTO expenseDTO) {
        try {
            CompanyExpense existingExpense = companyExpenseRepo.findOneByIdWithItems(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Company expense not found with ID: " + id));

            existingExpense.getExpenseItems().clear();

            existingExpense.setSource(expenseDTO.getSource());
            existingExpense.setExpenseDate(expenseDTO.getExpenseDate());
            existingExpense.setInvoiceNumber(expenseDTO.getInvoiceNumber());
            existingExpense.setCategory(expenseDTO.getCategory());

            for (CompanyExpenseItemDTO itemDTO : expenseDTO.getExpenseItems()) {
                CompanyExpenseItem newItem = CompanyExpenseItem.builder()
                        .companyExpense(existingExpense)
                        .name(itemDTO.getName())
                        .quantity(itemDTO.getQuantity())
                        .vatRate(itemDTO.getVatRate())
                        .price(itemDTO.getPrice())
                        .build();
                existingExpense.addExpenseItem(newItem);
            }

            existingExpense.calculateTotals();

            CompanyExpense savedExpense = companyExpenseRepo.save(existingExpense);
            return new CompanyExpenseDTO(savedExpense);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new UpdateException("Failed to update company expense. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteExpenseById(Long id) {
        try {
            CompanyExpense existingExpense = companyExpenseRepo.findOneByIdWithItems(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Company expense not found with ID: " + id));

            companyExpenseRepo.delete(existingExpense);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new DeletionException("Failed to delete company expense. Reason: " + e.getMessage(), e);
        }
    }

    // Helper method for preview calculations
    private CompanyExpense convertDtoToEntity(CompanyExpenseDTO dto) {
        CompanyExpense expense = CompanyExpense.builder().build();

        for (CompanyExpenseItemDTO itemDto : dto.getExpenseItems()) {
            CompanyExpenseItem item = CompanyExpenseItem.builder()
                    .price(itemDto.getPrice())
                    .quantity(itemDto.getQuantity())
                    .vatRate(itemDto.getVatRate())
                    .build();
            expense.addExpenseItem(item);
        }

        return expense;
    }
}
