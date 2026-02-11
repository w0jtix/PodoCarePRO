package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.StatSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StatSettingsRepo extends JpaRepository<StatSettings, Long> {

    default StatSettings getSettings() {
        return findById(1L).orElseGet(() -> {
            StatSettings defaults = StatSettings.builder().build();
            defaults.setId(1L);
            return save(defaults);
        });
    }
}
