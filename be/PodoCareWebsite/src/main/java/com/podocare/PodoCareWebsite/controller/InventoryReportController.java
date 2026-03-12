package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.InventoryReportDTO;
import com.podocare.PodoCareWebsite.DTO.request.InventoryReportFilterDTO;
import com.podocare.PodoCareWebsite.service.InventoryReportService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/inventory-reports")
public class InventoryReportController {

    private final InventoryReportService inventoryReportService;

    @PostMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<InventoryReportDTO>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestBody InventoryReportFilterDTO filter) {
        Page<InventoryReportDTO> reportsPage = inventoryReportService.getReports(filter, page, size);
        return new ResponseEntity<>(reportsPage, reportsPage.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InventoryReportDTO> getReportById(@PathVariable(value = "id") Long id) {
        InventoryReportDTO report = inventoryReportService.getReportById(id);
        return new ResponseEntity<>(report, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InventoryReportDTO> createReport(@NonNull @RequestBody InventoryReportDTO report) {
        InventoryReportDTO createdReport = inventoryReportService.createReport(report);
        return new ResponseEntity<>(createdReport, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InventoryReportDTO> updateReport(
            @PathVariable(value = "id") Long id,
            @NonNull @RequestBody InventoryReportDTO report) {
        InventoryReportDTO updatedReport = inventoryReportService.updateReport(id, report);
        return new ResponseEntity<>(updatedReport, HttpStatus.OK);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InventoryReportDTO> approveReport(@PathVariable(value = "id") Long id) {
        InventoryReportDTO approvedReport = inventoryReportService.approveReport(id);
        return new ResponseEntity<>(approvedReport, HttpStatus.OK);
    }

    @GetMapping("/all-approved")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> areAllApproved() {
        return new ResponseEntity<>(inventoryReportService.areAllApproved(), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteReport(@PathVariable(value = "id") Long id) {
        inventoryReportService.deleteReportById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
