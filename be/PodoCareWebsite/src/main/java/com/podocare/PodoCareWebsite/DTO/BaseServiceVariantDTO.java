package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.BaseService;
import com.podocare.PodoCareWebsite.model.BaseServiceVariant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BaseServiceVariantDTO {
    private Long id;
    private String name;
    private Double price;
    private Integer duration;

    public BaseServiceVariantDTO(BaseServiceVariant service) {
        this.id = service.getId();
        this.name = service.getName();
        this.price = service.getPrice();
        this.duration = service.getDuration();
    }

    public BaseServiceVariant toEntity(BaseService baseService) {
        return BaseServiceVariant.builder()
                .id(this.id)
                .name(this.name)
                .price(this.price)
                .duration(this.duration)
                .baseService(baseService)
                .build();
    }
}
