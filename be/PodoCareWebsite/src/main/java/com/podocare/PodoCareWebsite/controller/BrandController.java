package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.BrandDTO;
import com.podocare.PodoCareWebsite.DTO.request.KeywordFilterDTO;
import com.podocare.PodoCareWebsite.service.BrandService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.Objects.nonNull;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/brands")
public class BrandController {
    private final BrandService brandService;

    @PostMapping("/search")
    public ResponseEntity<List<BrandDTO>> getBrands(@RequestBody KeywordFilterDTO filter) {
        List<BrandDTO> brandDTOList = brandService.getBrands(filter);
        return new ResponseEntity<>(brandDTOList, brandDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable(value = "id") Long id){
        BrandDTO brand = brandService.getBrandById(id);
        return new ResponseEntity<>(brand, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO brand) {
        BrandDTO newBrand = brandService.createBrand(brand);
        return new ResponseEntity<>(newBrand, HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<BrandDTO>> createBrands(@RequestBody List<BrandDTO> brands) {
        List<BrandDTO> createdBrands = brandService.createBrands(brands);
        return new ResponseEntity<>(createdBrands, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable(value = "id") Long id, @NonNull @RequestBody BrandDTO brand){
        BrandDTO saved = brandService.updateBrand(id, brand);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable(value = "id") Long id) {
        brandService.deleteBrandById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
