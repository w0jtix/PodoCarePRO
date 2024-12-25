package com.podocare.PodoCareWebsite.model.order;

import com.podocare.PodoCareWebsite.model.product.product_category.BaseProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;

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
    private Order order;

    @ManyToOne
    @JoinColumn(name = "sale_product_id")
    private SaleProduct saleProduct;
    @ManyToOne
    @JoinColumn(name = "tool_product_id")
    private ToolProduct toolProduct;
    @ManyToOne
    @JoinColumn(name = "equipment_product_id")
    private EquipmentProduct equipmentProduct;

    private Integer quantity;

    private Double price;
    private String description;

    public Object getAssociatedProduct() {
        if (saleProduct != null) {
            return saleProduct;
        } else if (equipmentProduct != null) {
            return equipmentProduct;
        } else if (toolProduct != null) {
            return toolProduct;
        }
        return null;
    }

}
