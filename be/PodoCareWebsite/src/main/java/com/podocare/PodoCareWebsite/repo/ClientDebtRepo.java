package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.ClientDebt;
import com.podocare.PodoCareWebsite.model.Voucher;
import com.podocare.PodoCareWebsite.model.constants.DebtType;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import com.podocare.PodoCareWebsite.model.constants.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientDebtRepo extends JpaRepository<ClientDebt, Long> {
    Optional<ClientDebt> findOneById(Long id);

    Optional<ClientDebt> findOneBySourceVisitId(Long id);

    List<ClientDebt> findAllByClientIdAndPaymentStatus(Long id, PaymentStatus paymentStatus);

    @Query("""
    SELECT cd
    FROM ClientDebt cd
    WHERE (:paymentStatus IS NULL OR cd.paymentStatus = :paymentStatus)
      AND (COALESCE(:keyword, '') = ''
           OR LOWER(cd.client.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(cd.client.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    List<ClientDebt> findAllWithFilters(
            @Param("paymentStatus")PaymentStatus paymentStatus,
            @Param("keyword") String keyword
    );

    boolean existsByClientId(Long clientId);

    @Query("SELECT COALESCE(SUM(cd.value), 0) FROM ClientDebt cd JOIN cd.sourceVisit v WHERE v.employee.id = :empId AND cd.createdAt BETWEEN :from AND :to")
    Double sumDebtsCreated(@Param("empId") Long empId, @Param("from") java.time.LocalDate from, @Param("to") java.time.LocalDate to);
}
