package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.AuditLog;
import com.podocare.PodoCareWebsite.model.constants.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepo extends JpaRepository<AuditLog, Long> {

    @Query("""
        SELECT a FROM AuditLog a
        WHERE (:entityType IS NULL OR a.entityType = :entityType)
          AND (:action IS NULL OR a.action = :action)
          AND (:performedBy IS NULL OR a.performedBy = :performedBy)
          AND (:keyword IS NULL
               OR LOWER(a.oldValue) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(a.newValue) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND a.timestamp >= :dateFrom
          AND a.timestamp <= :dateTo
        ORDER BY a.timestamp DESC
    """)
    Page<AuditLog> findAllWithFilters(
            @Param("entityType") String entityType,
            @Param("action") AuditAction action,
            @Param("performedBy") String performedBy,
            @Param("keyword") String keyword,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}
