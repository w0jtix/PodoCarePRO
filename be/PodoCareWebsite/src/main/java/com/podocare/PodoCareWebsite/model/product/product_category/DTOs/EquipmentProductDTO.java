package com.podocare.PodoCareWebsite.model.product.product_category.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EquipmentProductDTO {

    private Long id;
    private String productName;
    private String brandName;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;

    private Integer warrantyLength;
}
