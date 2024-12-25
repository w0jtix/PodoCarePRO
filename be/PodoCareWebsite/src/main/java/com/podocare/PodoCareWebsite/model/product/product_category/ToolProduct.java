package com.podocare.PodoCareWebsite.model.product.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ToolProduct{
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
    private String category= "Tool";
    private Boolean isDeleted = false;

    @OneToMany(mappedBy = "toolProduct", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ToolProductInstance> productInstances = new ArrayList<>();

}