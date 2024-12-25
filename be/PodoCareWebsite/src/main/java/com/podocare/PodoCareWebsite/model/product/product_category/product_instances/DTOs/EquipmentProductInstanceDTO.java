package com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
public class EquipmentProductInstanceDTO {
    private String equipmentProductName;
    private Long equipmentProductId;
    private String supplierName;
    private Integer orderNumber;
    private Date purchaseDate;
    private Double purchasePrice;
    private String description;
    private Boolean outOfUse;
}
