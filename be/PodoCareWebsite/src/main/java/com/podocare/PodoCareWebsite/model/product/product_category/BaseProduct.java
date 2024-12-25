package com.podocare.PodoCareWebsite.model.product.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
public abstract class BaseProduct implements Serializable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String productName;
    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;
    private Integer initialSupply;
    private Integer currentSupply;
    private String description;


}
