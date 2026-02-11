package com.podocare.PodoCareWebsite.DTO.request;

import com.podocare.PodoCareWebsite.model.constants.UsageReason;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class UsageRecordFilterDTO {
    private String keyword;
    private List<Long> employeeIds;
    private UsageReason usageReason;
    private LocalDate startDate;
    private LocalDate endDate;
}
