package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.BaseServiceCategoryDTO;
import com.podocare.PodoCareWebsite.DTO.BaseServiceDTO;
import com.podocare.PodoCareWebsite.DTO.request.KeywordFilterDTO;
import com.podocare.PodoCareWebsite.DTO.request.ServiceFilterDTO;
import com.podocare.PodoCareWebsite.service.BaseServiceService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/services")
public class BaseServiceController {

    private final BaseServiceService baseServiceService;

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<BaseServiceDTO>> getBaseServices(@RequestBody ServiceFilterDTO filter) {
        List<BaseServiceDTO> serviceDTOList = baseServiceService.getBaseServices(filter);
        return new ResponseEntity<>(serviceDTOList, serviceDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<BaseServiceDTO>> getBaseServicesByCategoryId(@PathVariable(value="categoryId") Long categoryId) {
        List<BaseServiceDTO> serviceDTOList = baseServiceService.getBaseServicesByCategoryId(categoryId);
        return new ResponseEntity<>(serviceDTOList, serviceDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<BaseServiceDTO> createBaseService(@RequestBody BaseServiceDTO baseService) {
        BaseServiceDTO newService = baseServiceService.createBaseService(baseService);
        return new ResponseEntity<>(newService, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<BaseServiceDTO> updateBaseService(@PathVariable(value = "id") Long id, @NonNull @RequestBody BaseServiceDTO baseService) {
        BaseServiceDTO saved = baseServiceService.updateBaseService(id, baseService);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteBaseService(@PathVariable(value = "id") Long id) {
        baseServiceService.deleteBaseServiceById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
