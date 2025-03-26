package com.podocare.PodoCareWebsite.model.order.DTOs;

import lombok.Getter;
import lombok.Setter;
import com.podocare.PodoCareWebsite.model.VatRate;
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

    private String supplierName;
    private Long orderNumber;
    private VatRate shippingVatRate;
    private Double totalNet;
    private Double totalVat;
    private Double totalValue;
}
