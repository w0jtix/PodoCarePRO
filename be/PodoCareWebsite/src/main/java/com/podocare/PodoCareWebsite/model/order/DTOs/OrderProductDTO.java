package com.podocare.PodoCareWebsite.model.order.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductDTO {

    private Long orderProductId;
    private Long saleProductId;
    private Long toolProductId;
    private Long equipmentProductId;
    private Integer quantity;
    private Double price;
    private String description;
}
