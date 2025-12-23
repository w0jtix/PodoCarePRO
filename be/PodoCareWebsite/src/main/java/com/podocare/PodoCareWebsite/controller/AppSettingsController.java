package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.AppSettingsDTO;
import com.podocare.PodoCareWebsite.service.AppSettingsService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/settings")
public class AppSettingsController {

    private final AppSettingsService settingsService;

    @GetMapping
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<AppSettingsDTO> getSettings() {
        AppSettingsDTO settings = settingsService.getSettings();
        return new ResponseEntity<>(settings, HttpStatus.OK);
    }

    @PutMapping
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<AppSettingsDTO> updateSettings(@NonNull @RequestBody AppSettingsDTO settings) {
        AppSettingsDTO newSettings = settingsService.updateSettings(settings);
        return new ResponseEntity<>(newSettings, HttpStatus.OK);
    }
}