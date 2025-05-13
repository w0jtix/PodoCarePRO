package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.VatRate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderProductDisplayDTO {
    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String productCategoryName;
    private String productCategoryColor;
    private String productBrandName;
    private Integer quantity;
    private VatRate vatRate;
    private Double price;
}
