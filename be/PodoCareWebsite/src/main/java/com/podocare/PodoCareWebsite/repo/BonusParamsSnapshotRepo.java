package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.BonusParamsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BonusParamsSnapshotRepo extends JpaRepository<BonusParamsSnapshot, Long> {

    Optional<BonusParamsSnapshot> findByEmployeeIdAndYearAndMonth(Long employeeId, Integer year, Integer month);
}
