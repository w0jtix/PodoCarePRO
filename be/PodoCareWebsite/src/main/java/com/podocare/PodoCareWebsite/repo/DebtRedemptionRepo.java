package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.DebtRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DebtRedemptionRepo extends JpaRepository<DebtRedemption, Long> {
    Optional<DebtRedemption> findOneById(Long id);


}
