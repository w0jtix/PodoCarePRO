package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.CashLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface CashLedgerRepo extends JpaRepository<CashLedger, Long> {

    Optional<CashLedger> findByDate(LocalDate date);

    boolean existsByDate(LocalDate date);

    Optional<CashLedger> findTopByDateBeforeOrderByDateDesc(LocalDate date);

    Optional<CashLedger> findTopByIsClosedTrueOrderByDateDesc();

    Optional<CashLedger> findTopByIsClosedFalseAndDateBeforeOrderByDateDesc(LocalDate date);

    boolean existsByIsClosedFalse();

    @Query("SELECT cl FROM CashLedger cl " +
            "LEFT JOIN FETCH cl.createdBy " +
            "LEFT JOIN FETCH cl.closedBy " +
            "WHERE cl.id = :id")
    Optional<CashLedger> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT cl FROM CashLedger cl " +
            "WHERE cl.date BETWEEN :dateFrom AND :dateTo " +
            "AND (:employeeId IS NULL OR cl.createdBy.id = :employeeId)")
    Page<CashLedger> findAllWithFilters(
            @Param("employeeId") Long employeeId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable);
}
