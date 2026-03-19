package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.AuditLogDTO;
import com.podocare.PodoCareWebsite.DTO.request.AuditLogFilterDTO;
import com.podocare.PodoCareWebsite.model.AuditLog;
import org.springframework.data.domain.Page;

public interface AuditLogService {

    <T> void logCreate(String entityType, Long entityId, String entityKeyTrait, T newEntity);

    <T> void logUpdate(String entityType, Long entityId,String entityKeyTrait, T oldEntity, T newEntity);

    <T> void logDelete(String entityType, Long entityId,String entityKeyTrait, T deletedEntity);

    Page<AuditLogDTO> getAuditLogs(AuditLogFilterDTO filter, int page, int size);
}
