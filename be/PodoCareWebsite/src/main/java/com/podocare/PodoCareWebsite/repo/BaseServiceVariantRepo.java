package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.BaseServiceVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BaseServiceVariantRepo extends JpaRepository<BaseServiceVariant, Long> {

    Optional<BaseServiceVariant> findOneById(Long id);


}
