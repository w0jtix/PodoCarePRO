package com.podocare.PodoCareWebsite.model.order.DTOs;

import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductCreationDTO {
    private Long id;
    private String name;
    private String brandName;
    private Integer estimatedShelfLife;
    private String category;
    private Double estimatedSellingPrice;
    private String description;
    private Boolean isDeleted;

    private List<SaleProductInstanceDTO> saleProductInstances;
    private List<ToolProductInstanceDTO> toolProductInstances;
    private List<EquipmentProductInstanceDTO> equipmentProductInstances;

    private List<Long> instanceIdsToBeRemoved;
}
