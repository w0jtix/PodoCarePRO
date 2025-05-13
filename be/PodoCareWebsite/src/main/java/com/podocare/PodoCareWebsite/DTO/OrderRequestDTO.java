package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Order;
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
public class OrderRequestDTO {
    private Long id;
    private Long supplierId;
    private Long orderNumber;
    private Date orderDate;
    private List<OrderProductRequestDTO> orderProductDTOList;
    private VatRate shippingVatRate;
    private Double shippingCost;
    private Double totalNet;
    private Double totalVat;
    private Double totalValue;

    public OrderRequestDTO(Order order) {
        this.id = order.getId();
        this.supplierId = order.getSupplier().getId();
        this.orderNumber = order.getOrderNumber();
        this.orderDate = order.getOrderDate();
        this.orderProductDTOList = order.getOrderProducts().stream().map(OrderProductRequestDTO::new).toList();
        this.shippingVatRate = order.getShippingVatRate();
        this.shippingCost = order.getShippingCost();
        this.totalNet = order.getTotalNet();
        this.totalVat = order.getTotalVat();
        this.totalValue = order.getTotalValue();
    }

    public Order toEntity() {
        return Order.builder()
                .id(this.id)
                .supplier(SupplierDTO.toSupplierReference(this.supplierId))
                .orderNumber(this.orderNumber)
                .orderDate(this.orderDate)
                .orderProducts(this.orderProductDTOList.stream().map(OrderProductRequestDTO::toEntity).toList())
                .shippingVatRate(this.shippingVatRate)
                .shippingCost(this.shippingCost)
                .totalNet(this.totalNet)
                .totalVat(this.totalVat)
                .totalValue(this.totalValue)
                .build();
    }
}
