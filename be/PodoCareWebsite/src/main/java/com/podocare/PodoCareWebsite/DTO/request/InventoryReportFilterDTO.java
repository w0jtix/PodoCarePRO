package com.podocare.PodoCareWebsite.DTO.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryReportFilterDTO {
    private Long employeeId;
    private Integer year;
    private Integer month;
}
