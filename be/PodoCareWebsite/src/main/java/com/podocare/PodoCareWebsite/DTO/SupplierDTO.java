package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Supplier;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SupplierDTO {
    private Long id;
    private String name;
    private String websiteUrl;


    public SupplierDTO(Supplier supplier) {
        this.id = supplier.getId();
        this.name = supplier.getName();
        this.websiteUrl = supplier.getWebsiteUrl();
    }

    public Supplier toEntity() {
        return Supplier.builder()
                .id(this.id)
                .name(this.name)
                .websiteUrl(this.websiteUrl)
                .build();
    }
}
