package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.InventoryReportItem;
import com.podocare.PodoCareWebsite.service.ProductReferenceChecker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReportItemRepo extends JpaRepository<InventoryReportItem, Long>, ProductReferenceChecker {

    boolean existsByProductId(Long productId);
}
