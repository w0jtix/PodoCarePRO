package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.BrandDTO;
import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/brands")
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getBrands(@RequestBody(required = false) FilterDTO filter) {
        List<BrandDTO> brandDTOList = brandService.getBrands(filter);
        return new ResponseEntity<>(brandDTOList, brandDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable Long brandId){
        BrandDTO brandDTO = brandService.getBrandById(brandId);
        return new ResponseEntity<>(brandDTO, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO brandToCreate) {
        BrandDTO newBrand = brandService.createBrand(brandToCreate);
        return new ResponseEntity<>(newBrand, HttpStatus.CREATED);
    }

    @PutMapping("/{brandId}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable Long brandId, @RequestBody BrandDTO updatedBrand){
        BrandDTO brand = brandService.updateBrand(brandId, updatedBrand);
        return new ResponseEntity<>(brand, HttpStatus.OK);
    }

    @DeleteMapping("/{brandId}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long brandId) {
        brandService.deleteBrandById(brandId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
