package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.VisitDiscount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VisitDiscountRepo extends JpaRepository<VisitDiscount, Long> {

    Optional<VisitDiscount> findOneById(Long id);
}
