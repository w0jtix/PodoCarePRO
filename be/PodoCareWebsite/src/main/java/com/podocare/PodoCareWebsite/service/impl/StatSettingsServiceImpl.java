package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.StatSettingsDTO;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.repo.StatSettingsRepo;
import com.podocare.PodoCareWebsite.service.StatSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatSettingsServiceImpl implements StatSettingsService {

    private final StatSettingsRepo settingsRepo;

    @Override
    public StatSettingsDTO getSettings() {
        return new StatSettingsDTO(settingsRepo.getSettings());
    }

    @Override
    public StatSettingsDTO updateSettings(StatSettingsDTO settings) {
        try {
            StatSettingsDTO currentSettings = getSettings();

            settings.setId(currentSettings.getId());
            return new StatSettingsDTO(settingsRepo.save(settings.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Stat Settings. Reason: " + e.getMessage(), e);
        }
    }
}
