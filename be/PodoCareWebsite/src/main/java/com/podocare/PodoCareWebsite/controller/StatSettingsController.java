package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.StatSettingsDTO;
import com.podocare.PodoCareWebsite.service.StatSettingsService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stat-settings")
public class StatSettingsController {

    private final StatSettingsService settingsService;

    @GetMapping
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<StatSettingsDTO> getSettings() {
        StatSettingsDTO settings = settingsService.getSettings();
        return new ResponseEntity<>(settings, HttpStatus.OK);
    }

    @PutMapping
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<StatSettingsDTO> updateSettings(@NonNull @RequestBody StatSettingsDTO settings) {
        StatSettingsDTO newSettings = settingsService.updateSettings(settings);
        return new ResponseEntity<>(newSettings, HttpStatus.OK);
    }
}
