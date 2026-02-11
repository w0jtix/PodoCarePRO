package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {
    private Long id;
    private SupplierDTO supplier;
    private Long orderNumber;
    private LocalDate orderDate;
    private List<OrderProductDTO> orderProducts;
    private Double shippingCost;
    private Double totalNet;
    private Double totalVat;
    private Double totalValue;

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.supplier = new SupplierDTO(order.getSupplier());
        this.orderNumber = order.getOrderNumber();
        this.orderDate = order.getOrderDate();
        this.orderProducts = order.getOrderProducts().stream()
                .map(OrderProductDTO::new)
                .collect(Collectors.toList());
        this.shippingCost = order.getShippingCost();
        this.totalNet = order.getTotalNet();
        this.totalVat = order.getTotalVat();
        this.totalValue = order.getTotalValue();
    }

    public Order toEntity() {
        Order order = Order.builder()
                .id(this.id)
                .supplier(this.supplier.toEntity())
                .orderNumber(this.orderNumber)
                .orderDate(this.orderDate)
                .shippingCost(this.shippingCost)
                .totalNet(this.totalNet)
                .totalVat(this.totalVat)
                .totalValue(this.totalValue)
                .build();

        for (OrderProductDTO orderProductDTO : this.orderProducts) {
            OrderProduct orderProduct = orderProductDTO.toEntity(order);
            order.addOrderProduct(orderProduct);
        }

        return order;
    }
}
