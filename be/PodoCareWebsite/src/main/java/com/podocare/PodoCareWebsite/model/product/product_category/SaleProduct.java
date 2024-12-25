package com.podocare.PodoCareWebsite.model.product.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SaleProduct{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName;
    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;
    private Integer estimatedShelfLife; // user input in months
    private Double sellingPrice;
    private Boolean internalUse;
    private Boolean forSale;
    private String category= "Sale";
    private Boolean isDeleted = false;


    @OneToMany(mappedBy = "saleProduct", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<SaleProductInstance> productInstances = new ArrayList<>();

}
