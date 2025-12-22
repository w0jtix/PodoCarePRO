package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.DebtRedemption;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DebtRedemptionDTO {
    private Long id;
    private ClientDebtDTO debtSource;

    public DebtRedemptionDTO(DebtRedemption debtRedemption) {
        this.id = debtRedemption.getId();
        this.debtSource = new ClientDebtDTO(debtRedemption.getDebtSource());
    }

    public DebtRedemption toEntity() {
        return DebtRedemption.builder()
                .id(this.id)
                .debtSource(this.debtSource !=null ? this.debtSource.toEntity() : null)
                .build();
    }
}
