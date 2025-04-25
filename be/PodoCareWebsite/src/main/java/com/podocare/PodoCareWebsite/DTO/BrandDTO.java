package com.podocare.PodoCareWebsite.DTO;


import com.podocare.PodoCareWebsite.model.Brand;
import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BrandDTO {
    private Long id;
    private String brandName;

    public BrandDTO(Brand brand) {
        this.id = brand.getId();
        this.brandName = brand.getBrandName();
    }

    public Brand toEntity() {
        return Brand.builder()
                .id(this.id)
                .brandName(this.brandName)
                .build();
    }

    public static Brand toBrandReference(Long brandId) {
        if (brandId == null) {
            return null;
        }
        return Brand.builder().id(brandId).build();
    }
}
