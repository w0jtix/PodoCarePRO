package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "bonus_params_snapshot",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_bps_employee_period",
                columnNames = {"employee_id", "year", "month"}))
public class BonusParamsSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;

    @Column(name = "bonus_percent")
    private Double bonusPercent;

    @Column(name = "sale_bonus_percent")
    private Double saleBonusPercent;

    @Column(name = "boost_net_rate")
    private Double boostNetRate;

    @Column(name = "bonus_threshold")
    private Double bonusThreshold;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
