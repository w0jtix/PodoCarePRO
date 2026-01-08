package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppSettingsRepo extends JpaRepository<AppSettings, Long> {

    default AppSettings getSettings() {
        return findById(1L).orElseGet(() -> {
            AppSettings defaults = AppSettings.builder().build();
            defaults.setId(1L);
            return save(defaults);
        });
    }
}
