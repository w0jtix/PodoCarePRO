package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import com.podocare.PodoCareWebsite.model.constants.VatRate;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "company_expense")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(nullable = true)
    private String invoiceNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategory category;

    @OneToMany(mappedBy = "companyExpense", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<CompanyExpenseItem> expenseItems = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Double totalNet = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double totalVat = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Double totalValue = 0.0;

    public void addExpenseItem(CompanyExpenseItem item) {
        expenseItems.add(item);
        item.setCompanyExpense(this);
    }

    public void removeExpenseItem(CompanyExpenseItem item) {
        expenseItems.remove(item);
        item.setCompanyExpense(null);
    }

    /**
     * Calculates total net, VAT, and gross values based on expense items.
     * Logic identical to Order.calculateTotals() but without shipping cost.
     */
    public void calculateTotals() {
        double itemsGrossTotal = expenseItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        double itemsVat = expenseItems.stream()
                .mapToDouble(item -> {
                    double itemGrossTotal = item.getPrice() * item.getQuantity();
                    double vatRatePercent = getVatRateValue(item.getVatRate());

                    return itemGrossTotal * (vatRatePercent / (100.0 + vatRatePercent));
                })
                .sum();

        double itemsNet = itemsGrossTotal - itemsVat;

        this.totalNet = roundPrice(itemsNet);
        this.totalVat = roundPrice(itemsVat);
        this.totalValue = roundPrice(itemsGrossTotal);
    }

    private double getVatRateValue(VatRate vatRate) {
        if (vatRate == null || !vatRate.isNumeric()) {
            return 0.0;
        }
        return vatRate.getRate();
    }

    private double roundPrice(Double price) {
        return BigDecimal
                .valueOf(price)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
