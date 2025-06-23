package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.ProductCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductCategoryDTO {
    private Long id;
    private String name;
    private String color;

    public ProductCategoryDTO(ProductCategory category) {
        this.id = category.getId();
        this.name = category.getName();
        this.color = category.getColor();
    }

    public ProductCategory toEntity() {
        return ProductCategory.builder()
                .id(this.id)
                .name(this.name)
                .color(this.color)
                .build();
    }
}
