package com.podocare.PodoCareWebsite.model.product.product_category.DTOs;

import lombok.Getter;

@Getter
public class ToolProductDTO {
    private String productName;
    private String brandName;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;

}
