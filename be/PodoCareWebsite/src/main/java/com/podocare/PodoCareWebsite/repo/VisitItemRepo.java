package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.VisitItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VisitItemRepo extends JpaRepository<VisitItem, Long> {
    Optional<VisitItem> findOneById(Long id);

    boolean existsByServiceId(Long serviceId);

    boolean existsByServiceVariantId(Long serviceVariantId);
}
