package com.podocare.PodoCareWebsite.model.product.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import lombok.Getter;

import java.util.List;

@Getter
public class ProductFilterDTO {
    private List<String> productTypes;
    private List<Long> selectedIds;
    private String keyword;
}
