package com.podocare.PodoCareWebsite.DTO.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeBonusFilterDTO {
    private Long employeeId;
    private Integer month;
    private Integer year;
}
