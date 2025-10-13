package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.BaseServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BaseServiceCategoryRepo extends JpaRepository<BaseServiceCategory, Long> {

    Optional<BaseServiceCategory> findOneById(Long id);

    Optional<BaseServiceCategory> findByName(String name);

    Boolean existsByName(String name);
}
