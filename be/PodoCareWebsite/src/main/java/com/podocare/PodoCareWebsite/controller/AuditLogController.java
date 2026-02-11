package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.AuditLogDTO;
import com.podocare.PodoCareWebsite.DTO.request.AuditLogFilterDTO;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PostMapping("/search")
    public ResponseEntity<Page<AuditLogDTO>> getAuditLogs(
            @RequestBody(required = false) AuditLogFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Page<AuditLogDTO> logs = auditLogService.getAuditLogs(filter, page, size);
        return new ResponseEntity<>(logs, logs.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }
}
