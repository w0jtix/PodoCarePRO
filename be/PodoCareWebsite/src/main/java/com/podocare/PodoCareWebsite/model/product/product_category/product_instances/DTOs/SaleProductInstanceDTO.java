package com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs;

import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
public class SaleProductInstanceDTO {
    private Long id;
    private Long productId;

    private Date purchaseDate;
    private Double sellingPrice;
    private Date shelfLife;

    private String description;
    private Boolean isSold;
    private Boolean isUsed;
}
