package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Voucher;
import com.podocare.PodoCareWebsite.model.constants.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepo  extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findOneById(Long id);

    @Query("""
    SELECT v
    FROM Voucher v
    WHERE (:status IS NULL OR v.status = :status)
      AND (COALESCE(:keyword, '') = ''
           OR LOWER(v.client.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(v.client.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    List<Voucher> findAllWithFilters(
            @Param("status") VoucherStatus status,
            @Param("keyword") String keyword
    );

    boolean existsByClientId(Long clientId);
}
