package com.podocare.PodoCareWebsite.model.order.DTOs;

import lombok.Getter;

import java.util.Date;
import java.util.List;

@Getter
public class OrderFilterDTO {
    private List<Long> supplierIds;
    private Date dateFrom;
    private Date dateTo;
}
