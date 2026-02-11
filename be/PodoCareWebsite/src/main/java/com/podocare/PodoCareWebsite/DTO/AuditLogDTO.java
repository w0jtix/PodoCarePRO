package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.AuditLog;
import com.podocare.PodoCareWebsite.model.constants.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogDTO {
    private Long id;
    private String entityType;
    private Long entityId;
    private String entityKeyTrait;
    private AuditAction action;
    private String performedBy;
    private LocalDateTime timestamp;
    private String oldValue;
    private String newValue;
    private String changedFields;

    public AuditLogDTO(AuditLog auditLog) {
        this.id = auditLog.getId();
        this.entityType = auditLog.getEntityType();
        this.entityId = auditLog.getEntityId();
        this.entityKeyTrait = auditLog.getEntityKeyTrait();
        this.action = auditLog.getAction();
        this.performedBy = auditLog.getPerformedBy();
        this.timestamp = auditLog.getTimestamp();
        this.oldValue = auditLog.getOldValue();
        this.newValue = auditLog.getNewValue();
        this.changedFields = auditLog.getChangedFields();
    }
}
