package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.exceptions.InsufficientSupplyException;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(nullable = false)
    @Builder.Default
    private Integer supply = 0;

    @Column
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    public void addToSupply(Integer quantity) {
        this.supply += quantity;
    }

    public void reduceSupply(Integer quantity) {
        if (this.supply < quantity) {
            throw new InsufficientSupplyException("Not enough supply!");
        }
        this.supply =- quantity;
    }

    public void softDelete() {
        this.isDeleted = true;
        this.supply = 0;
    }

    public void restore(Integer newSupply) {
        this.isDeleted = false;
        this.supply = newSupply != null ? newSupply : 0;
    }
}