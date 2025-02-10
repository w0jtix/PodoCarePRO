package com.podocare.PodoCareWebsite.model.order.DTOs;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class OrderDTO {
    private Long orderId;
    private List<OrderProductDTO> orderProductDTOList;
    private Double shippingCost;
    private Date orderDate;
    private Long supplierId;
}
