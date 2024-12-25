package com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
public class ToolProductInstanceDTO {
    private String toolProductName;
    private Long toolProductId;
    private String supplierName;
    private Integer orderNumber;
    private Date purchaseDate;
    private Double purchasePrice;
    private String description;
    private Boolean outOfUse;
}
