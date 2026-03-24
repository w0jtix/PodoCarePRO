package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.constants.VatRate;
import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderProductDTO {

    private Long id;
    private ProductDTO product;
    private String name;
    private Integer quantity;
    private VatRate vatRate;
    private Double price;

    public OrderProductDTO(OrderProduct orderProduct) {
        this.id = orderProduct.getId();
        this.product = new ProductDTO(orderProduct.getProduct());
        this.name = orderProduct.getName();
        this.quantity = orderProduct.getQuantity();
        this.vatRate = orderProduct.getVatRate();
        this.price = orderProduct.getPrice();
    }

    public OrderProduct toEntity(Order order) {
        return OrderProduct.builder()
                .id(this.id)
                .order(order)
                .product(this.product.toEntity())
                .name(this.name)
                .quantity(this.quantity)
                .vatRate(this.vatRate)
                .price(this.price)
                .build();
    }
}
