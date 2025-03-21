package com.podocare.PodoCareWebsite.model.product.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.model.VatRate;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
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
public class SaleProductInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "sale_product_id", nullable = false)
    @JsonBackReference
    private SaleProduct saleProduct;

    private Date shelfLife;
    private Date purchaseDate;

    private Double sellingPrice;

    private String description;

    private Boolean isSold = false;
    private Boolean isUsed = false;

    @Transient
    public Boolean getIsAvailable() {
        return !Boolean.TRUE.equals(isSold) && !Boolean.TRUE.equals(isUsed);
    }
    @ManyToOne
    @JoinColumn(name = "sold_by_id")
    private Employee soldBy;
    @ManyToOne
    @JoinColumn(name = "used_by_id")
    private Employee usedBy;

}
