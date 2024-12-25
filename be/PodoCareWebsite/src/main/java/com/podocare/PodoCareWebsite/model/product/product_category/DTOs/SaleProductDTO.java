package com.podocare.PodoCareWebsite.model.product.product_category.DTOs;

import lombok.Getter;

@Getter
public class SaleProductDTO {

    private String productName;
    private String brandName;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;

    private Integer estimatedShelfLife;
    private Double sellingPrice;
    private Boolean internalUse;
    private Boolean forSale;
}
