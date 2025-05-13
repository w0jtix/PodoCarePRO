package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderProductRequestDTO {
    private Long id;
    private Long orderId;
    private Long productId;
    private Integer quantity;
    private VatRate vatRate;
    private Double price;

    public OrderProductRequestDTO(OrderProduct orderProduct) {
        this.id = orderProduct.getId();
        this.orderId = orderProduct.getOrder().getId();
        this.productId = orderProduct.getProduct().getId();
        this.quantity = orderProduct.getQuantity();
        this.vatRate = orderProduct.getVatRate();
        this.price = orderProduct.getPrice();
    }

    public OrderProduct toEntity() {
        return OrderProduct.builder()
                .id(this.id)
                .order(OrderDTO.toOrderReference(this.orderId))
                .product(ProductDTO.toProductReference(this.productId))
                .quantity(this.quantity)
                .vatRate(this.vatRate)
                .price(this.price)
                .build();
    }

    public OrderProduct toEntity(Order order) {
        return OrderProduct.builder()
                .id(this.id)
                .order(order)
                .product(ProductDTO.toProductReference(this.productId))
                .quantity(this.quantity)
                .vatRate(this.vatRate)
                .price(this.price)
                .build();
    }
}
