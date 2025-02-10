package com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs;

import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Setter
@Getter
public class SaleProductInstanceDTO {

    private Long saleProductId;
    private Long supplierId;
    private Long orderId;
    private Integer orderNumber;
    private Date purchaseDate;
    private Double netPrice;
    private VatRate vatRate;
    private Double purchasePrice;
    private String description;
    private Boolean isSold;
    private Boolean isUsed;
}
