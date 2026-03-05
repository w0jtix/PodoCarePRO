package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "cash_ledger", uniqueConstraints = {
        @UniqueConstraint(columnNames = "date")
})
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CashLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false)
    private Double openingAmount;

    @Column(nullable = false)
    @Builder.Default
    private Double deposit = 0.0;

    @Column(nullable = true)
    private Double closingAmount;

    @Column(nullable = false)
    @Builder.Default
    private Double cashOutAmount = 0.0;

    @Column(columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private Employee createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by_id")
    private Employee closedBy;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isClosed = false;
}
