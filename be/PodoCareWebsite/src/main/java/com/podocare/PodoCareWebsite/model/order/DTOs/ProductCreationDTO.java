package com.podocare.PodoCareWebsite.model.order.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCreationDTO {
    private Long id;
    private String name;
    private String brandName;
    private Integer shelfLife;
    private String category;
}
