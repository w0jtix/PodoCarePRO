package com.podocare.PodoCareWebsite.model.product.product_category.DTOs;

import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ToolProductDTO {

    private Long id;
    private String productName;
    private String brandName;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;
    private List<ToolProductInstanceDTO> productInstances;
    private String category;
}
