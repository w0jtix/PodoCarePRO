package com.podocare.PodoCareWebsite.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductDisplayDTO {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Long brandId;
    private String brandName;
    private String description;
    private Integer supply;

}
