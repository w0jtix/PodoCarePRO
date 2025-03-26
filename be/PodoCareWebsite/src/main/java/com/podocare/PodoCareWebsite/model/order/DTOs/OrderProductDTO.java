package com.podocare.PodoCareWebsite.model.order.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductDTO {

    private Long orderProductId;
    private Long orderId;
    private Long productId;
    private String productName;
    private String category;
    private Integer quantity;
    @JsonProperty("VATrate")
    private VatRate VATrate;
    private Double price;
}
