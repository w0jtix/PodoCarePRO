package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.UsageReason;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

import static java.util.Objects.isNull;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "usage_record")
public class UsageRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate usageDate;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "usage_reason", nullable = false)
    private UsageReason usageReason;
}
