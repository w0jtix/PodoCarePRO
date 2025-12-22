package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.AppSettingsDTO;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.repo.AppSettingsRepo;
import com.podocare.PodoCareWebsite.service.AppSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppSettingsServiceImpl implements AppSettingsService {

    private final AppSettingsRepo settingsRepo;

    @Override
    public AppSettingsDTO getSettings () {
        return new AppSettingsDTO(settingsRepo.getSettings());
    }

    @Override
    public AppSettingsDTO updateSettings(AppSettingsDTO settings) {
        try {
            AppSettingsDTO currentSettings = getSettings();

            settings.setId(currentSettings.getId());
            return new AppSettingsDTO(settingsRepo.save(settings.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Settings. Reason: " + e.getMessage(), e);
        }
    }
}
