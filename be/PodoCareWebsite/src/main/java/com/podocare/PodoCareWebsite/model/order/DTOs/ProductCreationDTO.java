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
    private Integer shelfLife;
    private String category;
    private Double sellingPrice;
    private String description;

    private List<SaleProductInstanceDTO> saleProductInstances;
    private List<ToolProductInstanceDTO> toolProductInstances;
    private List<EquipmentProductInstanceDTO> equipmentProductInstances;
}
