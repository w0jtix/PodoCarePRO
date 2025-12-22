package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.SaleItem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SaleItemDTO {
    private Long id;
    private ProductDTO product;
    private VoucherDTO voucher;
    private String name;
    private Double netValue;
    private Double vatValue;
    private Double price;

    public SaleItemDTO (SaleItem item) {
        this.id = item.getId();
        this.product = item.getProduct() != null ? new ProductDTO(item.getProduct()) : null;
        this.voucher = item.getVoucher() != null ?  new VoucherDTO(item.getVoucher()) : null;
        this.name = item.getName();
        this.netValue = item.getNetValue();
        this.vatValue = item.getVatValue();
        this.price = item.getPrice();
    }

    public SaleItem toEntity() {
        return SaleItem.builder()
                .id(this.id)
                .product(this.product !=null ? this.product.toEntity() : null)
                .voucher(this.voucher !=null ? this.voucher.toEntity() : null)
                .name(this.name)
                .netValue(this.netValue)
                .vatValue(this.vatValue)
                .price(this.price)
                .build();
    }
}
