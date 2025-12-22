package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Product;
import com.podocare.PodoCareWebsite.model.constants.VatRate;
import lombok.*;

import static java.util.Objects.isNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {

    private Long id;
    private String name;
    private ProductCategoryDTO category;
    private BrandDTO brand;
    private Integer supply;
    private Double sellingPrice;
    private VatRate vatRate;
    private String description;
    private Boolean isDeleted;

    public ProductDTO(Product product) {
        if(isNull(product))
            return;
        this.id = product.getId();
        this.name = product.getName();
        this.category = new ProductCategoryDTO(product.getCategory());
        this.brand = new BrandDTO(product.getBrand());
        this.supply = product.getSupply();
        this.sellingPrice = product.getSellingPrice();
        this.vatRate = product.getVatRate();
        this.description = product.getDescription();
        this.isDeleted = product.getIsDeleted();
    }

    public Product toEntity() {
        return Product.builder()
                .id(this.id)
                .name(this.name)
                .category(this.category.toEntity())
                .brand(this.brand.toEntity())
                .supply(this.supply)
                .sellingPrice(this.sellingPrice)
                .vatRate(this.vatRate != null ? this.vatRate : VatRate.VAT_23)
                .description(this.description)
                .isDeleted(this.isDeleted)
                .build();
    }
}
