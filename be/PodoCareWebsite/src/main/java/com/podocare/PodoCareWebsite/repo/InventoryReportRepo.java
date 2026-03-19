package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.InventoryReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface InventoryReportRepo extends JpaRepository<InventoryReport, Long> {

    @EntityGraph(attributePaths = {"createdBy", "items", "items.product", "items.product.brand", "items.product.category"})
    @Query("SELECT r FROM InventoryReport r WHERE r.id = :id")
    Optional<InventoryReport> findOneByIdWithDetails(@Param("id") Long id);

    @Query(
            value = """
    SELECT DISTINCT r FROM InventoryReport r
    LEFT JOIN r.createdBy e
    WHERE (:employeeId IS NULL OR e.id = :employeeId)
    AND (r.createdAt >= :dateFrom)
    AND (r.createdAt <= :dateTo)
    """,
            countQuery = """
    SELECT COUNT(DISTINCT r.id) FROM InventoryReport r
    LEFT JOIN r.createdBy e
    WHERE (:employeeId IS NULL OR e.id = :employeeId)
    AND (r.createdAt >= :dateFrom)
    AND (r.createdAt <= :dateTo)
    """
    )
    Page<InventoryReport> findAllWithFilters(
            @Param("employeeId") Long employeeId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );

    boolean existsByApprovedFalse();
}
