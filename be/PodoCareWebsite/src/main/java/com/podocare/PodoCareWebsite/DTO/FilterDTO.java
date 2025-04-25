package com.podocare.PodoCareWebsite.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class FilterDTO {
    private List<String> categories;
    private List<Long> brandIds;
    private String keyword;
    private Boolean available;
    private List<Long> supplierIds;
    private Date dateFrom;
    private Date dateTo;
}
