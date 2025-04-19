package com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs;

import lombok.Getter;

import java.util.List;

@Getter
public class BrandFilterDTO {
    private List<String> productTypes;
    private String keyword;
}
