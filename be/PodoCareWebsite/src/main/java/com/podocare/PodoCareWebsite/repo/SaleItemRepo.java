package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Sale;
import com.podocare.PodoCareWebsite.model.SaleItem;
import com.podocare.PodoCareWebsite.service.ProductReferenceChecker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SaleItemRepo extends JpaRepository<SaleItem, Long>, ProductReferenceChecker {
    Optional<Sale> findOneById(Long id);

    Boolean existsByVoucherId(Long voucherId);

    boolean existsByProductId(Long productId);
}
