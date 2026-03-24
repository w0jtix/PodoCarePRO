package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.InventoryReportItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReportItemDTO {

    private Long id;
    private ProductDTO product;
    private Integer supplyBefore;
    private Integer supplyAfter;

    public InventoryReportItemDTO(InventoryReportItem item) {
        this.id = item.getId();
        this.product = new ProductDTO(item.getProduct());
        this.supplyBefore = item.getSupplyBefore();
        this.supplyAfter = item.getSupplyAfter();
    }
}
