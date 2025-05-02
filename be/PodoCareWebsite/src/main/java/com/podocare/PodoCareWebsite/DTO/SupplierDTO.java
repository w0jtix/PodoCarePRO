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
    private Boolean isDeleted;


    public SupplierDTO(Supplier supplier) {
        this.id = supplier.getId();
        this.name = supplier.getName();
        this.websiteUrl = supplier.getWebsiteUrl();
        this.isDeleted = (supplier.getIsDeleted() == null) ? false : supplier.getIsDeleted();
    }

    public Supplier toEntity() {
        return Supplier.builder()
                .id(this.id)
                .name(this.name)
                .websiteUrl(this.websiteUrl)
                .isDeleted(this.isDeleted != null ? this.isDeleted : false)
                .build();
    }

    public static Supplier toSupplierReference(Long supplierId) {
        if (supplierId == null) {
            return null;
        }
        return Supplier.builder().id(supplierId).build();
    }
}
