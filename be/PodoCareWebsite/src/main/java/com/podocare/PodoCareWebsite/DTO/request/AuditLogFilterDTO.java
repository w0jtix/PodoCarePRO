package com.podocare.PodoCareWebsite.DTO.request;

import com.podocare.PodoCareWebsite.model.constants.AuditAction;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AuditLogFilterDTO {
    private String entityType;
    private AuditAction action;
    private String performedBy;
    private String keyword;
    private LocalDate dateFrom;
    private LocalDate dateTo;
}
