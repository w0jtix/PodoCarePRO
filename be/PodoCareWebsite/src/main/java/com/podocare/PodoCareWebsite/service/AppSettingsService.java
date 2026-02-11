package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.AppSettingsDTO;
import com.podocare.PodoCareWebsite.DTO.DiscountSettingsDTO;

public interface AppSettingsService {

    AppSettingsDTO getSettings();

    DiscountSettingsDTO getDiscountSettings();

    AppSettingsDTO updateSettings(AppSettingsDTO settings);
}
