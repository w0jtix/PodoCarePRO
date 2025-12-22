package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.DTO.ClientDTO;
import com.podocare.PodoCareWebsite.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepo extends JpaRepository<Client, Long> {

    Optional<Client> findOneById(Long id);

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.ClientDTO(
                        c,
                        (CASE WHEN (SELECT COUNT(d) FROM ClientDebt d WHERE d.client.id = c.id) > 0 THEN true ELSE false END),
                        (SELECT COUNT(v) FROM Visit v WHERE v.client.id = c.id AND SIZE(v.items) > 0),
                        (CASE WHEN (SELECT COUNT(vch) FROM Voucher vch WHERE vch.client.id = c.id AND vch.status = com.podocare.PodoCareWebsite.model.constants.VoucherStatus.ACTIVE) > 0 THEN true ELSE false END),
                        (CASE WHEN (SELECT COUNT(r) FROM Review r WHERE r.client.id = c.id AND r.source = com.podocare.PodoCareWebsite.model.constants.ReviewSource.BOOKSY) > 0 THEN true ELSE false END),
                        (CASE WHEN (SELECT COUNT(r) FROM Review r WHERE r.client.id = c.id AND r.source = com.podocare.PodoCareWebsite.model.constants.ReviewSource.GOOGLE) > 0 THEN true ELSE false END),
                        (CASE WHEN (SELECT COUNT(r) FROM Review r WHERE r.client.id = c.id AND r.source = com.podocare.PodoCareWebsite.model.constants.ReviewSource.GOOGLE AND r.isUsed = false) > 0 THEN true ELSE false END)
                    )
    FROM Client c
    WHERE c.isDeleted = false
      AND (:keyword IS NULL OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
         OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:boostClient IS NULL OR c.boostClient = :boostClient)
      AND (:signedRegulations IS NULL OR c.signedRegulations = :signedRegulations)
      AND (
            :hasDebts IS NULL
            OR (:hasDebts = true AND EXISTS (SELECT 1 FROM ClientDebt d WHERE d.client.id = c.id))
            OR (:hasDebts = false AND NOT EXISTS (SELECT 1 FROM ClientDebt d WHERE d.client.id = c.id))
          )
      AND (:discountId IS NULL OR c.discount.id = :discountId)
""")
    List<ClientDTO> findAllWithFilters(
            @Param("keyword") String keyword,
            @Param("boostClient") Boolean boostClient,
            @Param("signedRegulations") Boolean signedRegulations,
            @Param("hasDebts") Boolean hasDebts,
            @Param("discountId") Long discountId
    );

    List<Client> findAllByDiscountId(Long discountId);
}
