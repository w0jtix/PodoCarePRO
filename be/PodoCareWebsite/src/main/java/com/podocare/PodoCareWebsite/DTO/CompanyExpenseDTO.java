package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.CompanyExpense;
import com.podocare.PodoCareWebsite.model.CompanyExpenseItem;
import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CompanyExpenseDTO {
    private Long id;
    private String source;
    private LocalDate expenseDate;
    private String invoiceNumber;
    private ExpenseCategory category;
    private List<CompanyExpenseItemDTO> expenseItems;
    private Double totalNet;
    private Double totalVat;
    private Double totalValue;

    public CompanyExpenseDTO(CompanyExpense expense) {
        this.id = expense.getId();
        this.source = expense.getSource();
        this.expenseDate = expense.getExpenseDate();
        this.invoiceNumber = expense.getInvoiceNumber();
        this.category = expense.getCategory();
        this.expenseItems = expense.getExpenseItems().stream()
                .map(CompanyExpenseItemDTO::new)
                .collect(Collectors.toList());
        this.totalNet = expense.getTotalNet();
        this.totalVat = expense.getTotalVat();
        this.totalValue = expense.getTotalValue();
    }

    public CompanyExpense toEntity() {
        CompanyExpense expense = CompanyExpense.builder()
                .id(this.id)
                .source(this.source)
                .expenseDate(this.expenseDate)
                .invoiceNumber(this.invoiceNumber)
                .category(this.category)
                .totalNet(this.totalNet)
                .totalVat(this.totalVat)
                .totalValue(this.totalValue)
                .build();

        for (CompanyExpenseItemDTO itemDTO : this.expenseItems) {
            CompanyExpenseItem item = itemDTO.toEntity(expense);
            expense.addExpenseItem(item);
        }

        return expense;
    }
}
