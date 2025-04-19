package com.podocare.PodoCareWebsite.model.order;

import com.podocare.PodoCareWebsite.model.VatRate;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.ToString;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    @ToString.Exclude
    private Order order;

    @Column(name = "sale_product_id")
    private Long saleProductId;
    @Column(name = "tool_product_id")
    private Long toolProductId;
    @Column(name = "equipment_product_id")
    private Long equipmentProductId;

    private Integer quantity;
    private VatRate VATrate;
    private Double price;
}
