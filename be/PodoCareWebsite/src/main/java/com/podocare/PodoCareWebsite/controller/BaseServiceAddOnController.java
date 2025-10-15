package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.BaseServiceAddOnDTO;
import com.podocare.PodoCareWebsite.service.BaseServiceAddOnService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service-addons")
public class BaseServiceAddOnController {

    private final BaseServiceAddOnService baseServiceAddOnService;

    @GetMapping("/all")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<BaseServiceAddOnDTO>> getBaseServiceAddOns() {
        List<BaseServiceAddOnDTO> serviceAddOnDTOList = baseServiceAddOnService.getAllBaseServiceAddOns();
        return new ResponseEntity<>(serviceAddOnDTOList, serviceAddOnDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<BaseServiceAddOnDTO> createBaseServiceAddOn(@RequestBody BaseServiceAddOnDTO baseServiceAddOn) {
        BaseServiceAddOnDTO newServiceAddOn = baseServiceAddOnService.createBaseServiceAddOn(baseServiceAddOn);
        return new ResponseEntity<>(newServiceAddOn, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<BaseServiceAddOnDTO> updateBaseServiceAddOn(@PathVariable(value = "id") Long id, @NonNull @RequestBody BaseServiceAddOnDTO baseServiceAddOn) {
        BaseServiceAddOnDTO saved = baseServiceAddOnService.updateBaseServiceAddOn(id, baseServiceAddOn);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteBaseServiceAddOn(@PathVariable(value = "id") Long id) {
        baseServiceAddOnService.deleteBaseServiceAddOnById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
