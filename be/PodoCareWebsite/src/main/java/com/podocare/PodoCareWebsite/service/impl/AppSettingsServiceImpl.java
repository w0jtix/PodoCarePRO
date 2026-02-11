package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.AppSettingsDTO;
import com.podocare.PodoCareWebsite.DTO.DiscountSettingsDTO;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.repo.AppSettingsRepo;
import com.podocare.PodoCareWebsite.service.AppSettingsService;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppSettingsServiceImpl implements AppSettingsService {

    private final AppSettingsRepo settingsRepo;
    private final AuditLogService auditLogService;

    @Override
    public AppSettingsDTO getSettings () {
        return new AppSettingsDTO(settingsRepo.getSettings());
    }

    @Override
    public DiscountSettingsDTO getDiscountSettings() {
        return new DiscountSettingsDTO(settingsRepo.getSettings());
    }

    @Override
    public AppSettingsDTO updateSettings(AppSettingsDTO settings) {
        try {
            AppSettingsDTO oldSettings = getSettings();

            settings.setId(oldSettings.getId());
            AppSettingsDTO savedSettings = new AppSettingsDTO(settingsRepo.save(settings.toEntity()));

            auditLogService.logUpdate("AppSettings", savedSettings.getId(),null, oldSettings, savedSettings);
            return savedSettings;
        } catch (Exception e) {
            throw new UpdateException("Failed to update Settings. Reason: " + e.getMessage(), e);
        }
    }
}
