package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.BaseServiceCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BaseServiceCategoryDTO {
    private Long id;
    private String name;
    private String color;

    public BaseServiceCategoryDTO(BaseServiceCategory category) {
        this.id = category.getId();
        this.name = category.getName();
        this.color = category.getColor();
    }

    public BaseServiceCategory toEntity() {
        return BaseServiceCategory.builder()
                .id(this.id)
                .name(this.name)
                .color(this.color)
                .build();
    }
}
