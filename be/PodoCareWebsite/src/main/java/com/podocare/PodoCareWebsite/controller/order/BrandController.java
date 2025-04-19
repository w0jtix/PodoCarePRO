package com.podocare.PodoCareWebsite.controller.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.BrandDTO;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.BrandFilterDTO;
import com.podocare.PodoCareWebsite.repo.order.BrandRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/brands")
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getBrands(@RequestBody(required = false) BrandFilterDTO filter) {
        List<BrandDTO> brandDTOList = brandService.getBrandDTOs(filter);
        return new ResponseEntity<>(brandDTOList, brandDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable Long brandId){
        BrandDTO brandDTO = brandService.getBrandDTOById(brandId);
        return new ResponseEntity<>(brandDTO, HttpStatus.OK);
    }


    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@RequestBody BrandDTO brandDTO) {
        BrandDTO newBrand = brandService.createBrand(brandDTO);
        return new ResponseEntity<>(newBrand, HttpStatus.CREATED);
    }

    @PutMapping("/{brandId}")
    public ResponseEntity<BrandDTO> updateProduct(@PathVariable Long brandId, @RequestBody BrandDTO brandDTO){
        BrandDTO updatedBrand = brandService.updateBrand(brandId, brandDTO);
        return new ResponseEntity<>(updatedBrand, HttpStatus.OK);
    }

    @DeleteMapping("/{brandId}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long brandId) {
        brandService.deleteBrand(brandId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
