package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.SupplyManager;
import com.podocare.PodoCareWebsite.repo.SupplyManagerRepo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SupplyManagerDTO {
    private Long id;
    private Long productId;
    private Boolean isDeleted;
    private Integer supply;
    private String action;

    public SupplyManagerDTO(SupplyManager manager) {
        this.id = manager.getId();
        this.productId = manager.getProductId();
        this.supply = manager.getSupply();
    }

    public SupplyManagerDTO(Long productId, Integer supply) {
        this.productId = productId;
        this.supply = supply;
    }

    public SupplyManagerDTO(Long productId, Integer supply, String action) {
        this.productId = productId;
        this.supply = supply;
        this.action = action;
    }

    public SupplyManager toEntity() {
        return SupplyManager.builder()
                .id(this.id)
                .productId(this.productId)
                .supply(this.supply)
                .build();
    }

    public static SupplyManager toSupplyManagerReference(Long productId) {
        if(productId == null){
            return null;
        }
        return SupplyManager.builder().productId(productId).build();
    }
}
