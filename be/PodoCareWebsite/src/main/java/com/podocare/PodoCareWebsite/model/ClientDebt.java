package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.DebtType;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import com.podocare.PodoCareWebsite.model.constants.VatRate;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "client_debt")
public class ClientDebt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private Visit sourceVisit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DebtType type;

    @Column(nullable = false)
    private Double value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus= PaymentStatus.UNPAID;

    @Column(nullable = true)
    private LocalDate createdAt;
}
