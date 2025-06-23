package com.podocare.PodoCareWebsite.DTO.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductFilterDTO {
    private List<Long> productIds;
    private List<Long> categoryIds;
    private List<Long> brandIds;
    private String keyword;
    private Boolean available;
    private Boolean includeZero;
    private Boolean isDeleted;
}
