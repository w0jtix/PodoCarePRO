package com.podocare.PodoCareWebsite.DTO.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class OrderFilterDTO {
    private List<Long> supplierIds;
    private Integer year;
    private Integer month;
}
