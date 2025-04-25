package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Product;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {

    private Long id;
    private String productName;
    private String category;
    private Long brandId;
    private String brandName;
    private String description;
    private Boolean isDeleted;


    public ProductDTO(Product product) {
        this.id = product.getId();
        this.productName = product.getProductName();
        this.category = product.getCategory();
        this.brandId = product.getBrand().getId();
        this.brandName = product.getBrand().getBrandName();
        this.description = product.getDescription();
        this.isDeleted = (product.getIsDeleted() == null) ? false : product.getIsDeleted();
    }

    public Product toEntity() {
        return Product.builder()
                .id(this.id)
                .productName(this.productName)
                .category(this.category)
                .brand(BrandDTO.toBrandReference(this.brandId))
                .description(this.description)
                .isDeleted(this.isDeleted != null ? this.isDeleted : false)
                .build();
    }

    public static Product toProductReference(Long productId) {
        if (productId == null) {
            return null;
        }
        return Product.builder().id(productId).build();
    }
}
