package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.BaseService;
import com.podocare.PodoCareWebsite.model.BaseServiceAddOn;
import com.podocare.PodoCareWebsite.model.BaseServiceVariant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BaseServiceDTO {
    private Long id;
    private String name;
    private Double price;
    private Integer duration;
    private BaseServiceCategoryDTO category;
    private List<BaseServiceVariantDTO> variants = new ArrayList<>();
    private List<BaseServiceAddOnDTO> addOns = new ArrayList<>();

    public BaseServiceDTO(BaseService service) {
        this.id = service.getId();
        this.name = service.getName();
        this.price = service.getPrice();
        this.duration = service.getDuration();
        this.category = new BaseServiceCategoryDTO(service.getCategory());
        if(nonNull(service.getVariants()))
            this.variants = service.getVariants().stream()
                    .map(BaseServiceVariantDTO::new)
                    .collect(Collectors.toList());
        if(nonNull(service.getAddOns()))
            this.addOns = service.getAddOns().stream()
                    .map(BaseServiceAddOnDTO::new)
                    .collect(Collectors.toList());
    }

    public BaseService toEntity() {
        BaseService service = BaseService.builder()
                .id(this.id)
                .name(this.name)
                .price(this.price)
                .duration(this.duration)
                .category(this.category.toEntity())
                .variants(new HashSet<>())
                .addOns(new HashSet<>())
                .build();

        if (nonNull(this.variants)) {
            Set<BaseServiceVariant> variantEntities = this.variants.stream()
                    .map(dto -> dto.toEntity(service))
                    .collect(Collectors.toSet());
            service.setVariants(variantEntities);
        }

        if (nonNull(this.addOns)) {
            Set<BaseServiceAddOn> addOnEntities = this.addOns.stream()
                    .map(BaseServiceAddOnDTO::toEntity)
                    .collect(Collectors.toSet());
            service.setAddOns(addOnEntities);
        }

        return service;
    }
}
