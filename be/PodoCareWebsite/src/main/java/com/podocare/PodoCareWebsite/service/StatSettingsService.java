package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.StatSettingsDTO;

public interface StatSettingsService {

    StatSettingsDTO getSettings();

    StatSettingsDTO updateSettings(StatSettingsDTO settings);
}
