package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.BaseService;
import com.podocare.PodoCareWebsite.model.VisitItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VisitItemDTO {
    private Long id;
    private BaseServiceDTO service;
    private BaseServiceVariantDTO serviceVariant;
    private String name;
    private int duration;
    private Double price;
    private Double finalPrice;
    private Boolean boostItem;

    public VisitItemDTO (VisitItem item) {
        this.id = item.getId();
        this.service = item.getService() != null ? new BaseServiceDTO(item.getService()) : null;
        this.serviceVariant = item.getServiceVariant() != null ? new BaseServiceVariantDTO(item.getServiceVariant()) : null;
        this.name = item.getName();
        this.duration = item.getDuration();
        this.price = item.getPrice();
        this.finalPrice = item.getFinalPrice();
        this.boostItem = item.getBoostItem();
    }

    public VisitItem toEntity() {
        BaseService service = this.service != null ? this.service.toEntity() : null;

        return VisitItem.builder()
                .id(this.id)
                .service(service)
                .serviceVariant(this.serviceVariant != null ? this.serviceVariant.toEntity(service) : null)
                .name(this.name)
                .duration(this.duration)
                .price(this.price)
                .finalPrice(this.finalPrice)
                .boostItem(this.boostItem != null ? this.boostItem : false)
                .build();
    }

}

