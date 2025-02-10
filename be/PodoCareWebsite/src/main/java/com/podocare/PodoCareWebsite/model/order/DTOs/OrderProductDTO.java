package com.podocare.PodoCareWebsite.model.order.DTOs;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductDTO {

    private Long orderProductId;
    private Long id;
    private String productName;
    private Integer quantity;
    @JsonProperty("VATrate")
    private VatRate VATrate;
    private Double price;
}
