package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.BaseServiceAddOn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BaseServiceAddOnRepo extends JpaRepository<BaseServiceAddOn, Long> {

    Optional<BaseServiceAddOn> findOneById(Long id);

    Optional<BaseServiceAddOn> findByName(String name);

    Boolean existsByName(String name);
}

