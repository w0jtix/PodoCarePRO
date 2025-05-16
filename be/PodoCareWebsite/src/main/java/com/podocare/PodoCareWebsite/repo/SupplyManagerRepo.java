package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.DTO.SupplyManagerDTO;
import com.podocare.PodoCareWebsite.model.SupplyManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SupplyManagerRepo extends JpaRepository<SupplyManager, Long> {

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.SupplyManagerDTO(
        s.id, s.productId, p.isDeleted, s.supply, NULL
    )
    FROM SupplyManager s
    JOIN Product p ON s.productId = p.id
    WHERE s.productId = :productId
""")
    Optional<SupplyManagerDTO> findDTOByProductId(@Param("productId") Long productId);
}
