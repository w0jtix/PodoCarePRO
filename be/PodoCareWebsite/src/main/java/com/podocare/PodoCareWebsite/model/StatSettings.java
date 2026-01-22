package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "stat_settings")
public class StatSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private Integer bonusThreshold = 1000;

    @Column(nullable = false)
    @Builder.Default
    private Integer servicesRevenueGoal = 3000;

    @Column(nullable = false)
    @Builder.Default
    private Integer productsRevenueGoal = 500;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "stat_settings_sale_bonus_payout_months", joinColumns = @JoinColumn(name = "stat_settings_id"))
    @Column(name = "month")
    @Builder.Default
    private Set<Integer> saleBonusPayoutMonths = Set.of(1, 4, 7, 10);

    @PrePersist
    @PreUpdate
    private void validateSaleBonusPayoutMonths() {
        if (saleBonusPayoutMonths == null || saleBonusPayoutMonths.isEmpty()) {
            return;
        }

        int firstModulo = saleBonusPayoutMonths.iterator().next() % 3;
        boolean allSameModulo = saleBonusPayoutMonths.stream()
                .allMatch(month -> month % 3 == firstModulo);

        if (!allSameModulo) {
            throw new IllegalArgumentException("Sale bonus payout months must be evenly spaced (every 3 months)");
        }
    }
}
