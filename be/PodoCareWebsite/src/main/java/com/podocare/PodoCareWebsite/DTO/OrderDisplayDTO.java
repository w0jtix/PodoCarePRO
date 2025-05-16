package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDisplayDTO {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long orderNumber;
    private Date orderDate;
    private List<OrderProductDisplayDTO> orderProductDTOList;
    private VatRate shippingVatRate;
    private Double shippingCost;
    private Double totalNet;
    private Double totalVat;
    private Double totalValue;
}
