package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "visit")
public class Visit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "visit_id", nullable = false)
    private List<VisitDiscount> serviceDiscounts = new ArrayList<>();

    @Column(nullable = true)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean receipt = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isBoost = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isVip = false;

    @Column(nullable = true)
    private Integer delayTime;

    @Column(nullable = false)
    @Builder.Default
    private Boolean absence = false;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "visit_id")
    private List<VisitItem> items = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sale_id")
    private Sale sale;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "visit_id")
    private List<DebtRedemption> debtRedemptions = new ArrayList<>();

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus= PaymentStatus.PAID;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "visit_id") // moze byc empty jesli absence
    private List<Payment> payments = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Double totalNet = 0.0;
    @Column(nullable = false)
    @Builder.Default
    private Double totalVat = 0.0;
    @Column(nullable = false)
    @Builder.Default
    private Double totalValue = 0.0;

}
