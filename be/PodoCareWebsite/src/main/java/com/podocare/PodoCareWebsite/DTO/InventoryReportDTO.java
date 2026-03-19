package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.InventoryReport;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReportDTO {

    private Long id;
    private EmployeeSummaryDTO createdBy;
    private LocalDate createdAt;
    private Boolean approved;
    private List<InventoryReportItemDTO> items;

    public InventoryReportDTO(InventoryReport report) {
        this.id = report.getId();
        this.createdBy = new EmployeeSummaryDTO(report.getCreatedBy());
        this.createdAt = report.getCreatedAt();
        this.approved = report.getApproved();
        this.items = report.getItems().stream()
                .map(InventoryReportItemDTO::new)
                .collect(Collectors.toList());
    }
}
