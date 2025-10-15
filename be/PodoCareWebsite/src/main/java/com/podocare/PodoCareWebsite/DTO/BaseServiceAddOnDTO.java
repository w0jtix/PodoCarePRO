package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.BaseServiceAddOn;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BaseServiceAddOnDTO {
    private Long id;
    private String name;
    private Double price;
    private int duration;

    public BaseServiceAddOnDTO(BaseServiceAddOn service) {
        this.id = service.getId();
        this.name = service.getName();
        this.price = service.getPrice();
        this.duration = service.getDuration();
    }

    public BaseServiceAddOn toEntity() {
        return BaseServiceAddOn.builder()
                .id(this.id)
                .name(this.name)
                .price(this.price)
                .duration(this.duration)
                .build();
    }
}
