package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Order;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.extern.slf4j.Slf4j;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private Long orderNumber;
    private Date orderDate;
    private List<OrderProductDTO> orderProductDTOList;
    private VatRate shippingVatRate;
    private Double shippingCost;
    private Double totalNet;
    private Double totalVat;
    private Double totalValue;

   /* private List<Long> removedOrderProducts; // only Ids
    private List<OrderProductDTO> editedOrderProducts;
    private List<OrderProductDTO> addedOrderProducts;*/

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.supplierId = order.getSupplier().getId();
        this.supplierName = order.getSupplier().getName();
        this.orderNumber = order.getOrderNumber();
        this.orderDate = order.getOrderDate();
        this.orderProductDTOList = order.getOrderProducts().stream().map(OrderProductDTO::new).toList();
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
                .orderProducts(this.orderProductDTOList.stream().map(OrderProductDTO::toEntity).toList())
                .shippingVatRate(this.shippingVatRate)
                .shippingCost(this.shippingCost)
                .totalNet(this.totalNet)
                .totalVat(this.totalVat)
                .totalValue(this.totalValue)
                .build();
    }

    public static Order toOrderReference(Long orderId) {
        if(orderId == null) {
            return null;
        }
        return Order.builder().id(orderId).build();
    }

}
