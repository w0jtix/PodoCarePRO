package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.PaymentMethod;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "payment")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Column(nullable = false)
    private Double amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher; // if paid by voucher attach it

    @PrePersist
    @PreUpdate
    private void validatePayment() {
        if (method == PaymentMethod.VOUCHER && voucher == null) {
            throw new IllegalStateException("Voucher must be assigned for VOUCHER payment method.");
        }
        if (method != PaymentMethod.VOUCHER && voucher != null) {
            throw new IllegalStateException("Voucher should only be assigned when payment method is VOUCHER.");
        }
    }
}
