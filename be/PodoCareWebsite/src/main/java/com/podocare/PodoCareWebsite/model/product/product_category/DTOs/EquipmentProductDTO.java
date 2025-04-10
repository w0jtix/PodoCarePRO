package com.podocare.PodoCareWebsite.model.product.product_category.DTOs;

import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EquipmentProductDTO {

    private Long id;
    private String productName;
    private String brandName;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;
    private List<EquipmentProductInstanceDTO> productInstances;
    private String category;
    private Boolean isDeleted;

    private Integer warrantyLength;

    private List<EquipmentProductInstanceDTO> activeProductInstances;
}
