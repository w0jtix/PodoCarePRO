package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.SupplyManager;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupplyManagerRepo extends JpaRepository<SupplyManager, Long> {

    Optional<SupplyManager>  findByProductId(Long productId);
}
