package com.podocare.PodoCareWebsite.model.product.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.VatRate;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentProductInstance{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "equipment_product_id", nullable = false)
    @JsonBackReference
    private EquipmentProduct equipmentProduct;

    private Date warrantyEndDate;
    private Date purchaseDate;

    private String description;
    private Boolean outOfUse = false;

    @Transient
    public Boolean getIsAvailable() {
        return !Boolean.TRUE.equals(outOfUse);
    }
}
