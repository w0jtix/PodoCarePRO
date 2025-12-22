package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.AppSettingsDTO;

public interface AppSettingsService {

    AppSettingsDTO getSettings();

    AppSettingsDTO updateSettings(AppSettingsDTO settings);
}
