package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.exceptions.InsufficientSupplyException;
import com.podocare.PodoCareWebsite.model.constants.Unit;
import com.podocare.PodoCareWebsite.model.constants.VatRate;
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

    @Column(nullable = true)
    private Double sellingPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "vat_rate", nullable = false)
    @Builder.Default
    private VatRate vatRate = VatRate.VAT_23;

    @Column
    private String description;

    @Column(nullable = true)
    private Integer volume;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = true)
    private Unit unit;

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
        this.supply -= quantity;
    }

    public void softDelete() {
        this.isDeleted = true;
        this.supply = 0;
    }

    public void restore(Integer newSupply) {
        this.isDeleted = false;
        this.supply = newSupply != null ? newSupply : 0;
    }

    @PrePersist
    @PreUpdate
    private void setDefaultVatRate() {
        if (vatRate == null) {
            vatRate = VatRate.VAT_23;
        }
    }
}