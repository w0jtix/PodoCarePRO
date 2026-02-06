package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.VatRate;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_expense_item")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyExpenseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_expense_id", nullable = false)
    @ToString.Exclude
    private CompanyExpense companyExpense;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "vat_rate", nullable = false)
    private VatRate vatRate;

    @Column(name = "price", nullable = false)
    private Double price;
}
