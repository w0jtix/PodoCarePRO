package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName;
    private String category;
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;
    private String description;
    private Boolean isDeleted = false;

}