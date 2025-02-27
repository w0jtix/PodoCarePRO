package com.podocare.PodoCareWebsite.model.product.product_category.DTOs;

import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SaleProductDTO {

    private Long id;
    private String productName;
    private String brandName;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;
    private List<SaleProductInstanceDTO> productInstances;

    private Integer estimatedShelfLife;
    private Double sellingPrice;
    private Boolean internalUse;
    private Boolean forSale;
}
