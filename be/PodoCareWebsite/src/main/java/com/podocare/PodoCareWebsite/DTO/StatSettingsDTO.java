package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.StatSettings;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StatSettingsDTO {
    private Long id;
    private Integer bonusThreshold;
    private Integer servicesRevenueGoal;
    private Integer productsRevenueGoal;
    private Set<Integer> saleBonusPayoutMonths;

    public StatSettingsDTO(StatSettings settings) {
        this.id = settings.getId();
        this.bonusThreshold = settings.getBonusThreshold();
        this.servicesRevenueGoal = settings.getServicesRevenueGoal();
        this.productsRevenueGoal = settings.getProductsRevenueGoal();
        this.saleBonusPayoutMonths = settings.getSaleBonusPayoutMonths();
    }

    public StatSettings toEntity() {
        return StatSettings.builder()
                .id(this.id)
                .bonusThreshold(this.bonusThreshold)
                .servicesRevenueGoal(this.servicesRevenueGoal)
                .productsRevenueGoal(this.productsRevenueGoal)
                .saleBonusPayoutMonths(this.saleBonusPayoutMonths)
                .build();
    }
}
