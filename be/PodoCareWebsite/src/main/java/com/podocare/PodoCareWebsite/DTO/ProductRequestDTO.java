package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Product;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequestDTO {
    private Long id;
    private String name;
    private Long categoryId;
    private Long brandId;
    private String description;
    private Boolean isDeleted;
    private Integer supply;


    public ProductRequestDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.categoryId = product.getCategory().getId();
        this.brandId = product.getBrand().getId();
        this.description = product.getDescription();
        this.isDeleted = (product.getIsDeleted() == null) ? false : product.getIsDeleted();
    }

    public Product toEntity() {
        return Product.builder()
                .id(this.id)
                .name(this.name)
                .category(CategoryDTO.toCategoryReference(this.categoryId))
                .brand(BrandDTO.toBrandReference(this.brandId))
                .description(this.description)
                .isDeleted(this.isDeleted != null ? this.isDeleted : false)
                .build();
    }
}
