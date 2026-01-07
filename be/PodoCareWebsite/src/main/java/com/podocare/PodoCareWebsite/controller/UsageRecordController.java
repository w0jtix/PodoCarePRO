package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.UsageRecordDTO;
import com.podocare.PodoCareWebsite.DTO.request.UsageRecordFilterDTO;
import com.podocare.PodoCareWebsite.service.UsageRecordService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/usage-records")
public class UsageRecordController {

    private final UsageRecordService usageRecordService;

    @PostMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<UsageRecordDTO>> getUsageRecords(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestBody UsageRecordFilterDTO filter) {
        Page<UsageRecordDTO> usageRecordsPage = usageRecordService.getUsageRecords(filter, page, size);
        return new ResponseEntity<>(usageRecordsPage, usageRecordsPage.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UsageRecordDTO> getUsageRecordById(@PathVariable(value = "id") Long id) {
        UsageRecordDTO usageRecord = usageRecordService.getUsageRecordById(id);
        return new ResponseEntity<>(usageRecord, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UsageRecordDTO> createUsageRecord(@NonNull @RequestBody UsageRecordDTO usageRecord) {
        UsageRecordDTO createdUsageRecord = usageRecordService.createUsageRecord(usageRecord);
        return new ResponseEntity<>(createdUsageRecord, HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UsageRecordDTO>> createUsageRecords(@NonNull @RequestBody List<UsageRecordDTO> usageRecords) {
        List<UsageRecordDTO> createdUsageRecords = usageRecordService.createUsageRecords(usageRecords);
        return new ResponseEntity<>(createdUsageRecords, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteUsageRecord(@PathVariable(value = "id") Long id) {
        usageRecordService.deleteUsageRecordById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
