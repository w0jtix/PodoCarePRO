package com.podocare.PodoCareWebsite.controller.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.BrandDTO;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.BrandFilterDTO;
import com.podocare.PodoCareWebsite.repo.order.BrandRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/brands")
public class BrandController {
    @Autowired
    BrandService brandService;


    @GetMapping
    public ResponseEntity<List<Brand>> getBrands() {
        List<Brand> brandList = brandService.getBrands();
        return new ResponseEntity<>(brandList, brandList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        List<BrandDTO> brandDTOList = brandService.getBrandDTOs();
        return new ResponseEntity<>(brandDTOList, brandDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PostMapping("/filter")
    public ResponseEntity<List<BrandDTO>> getFilteredBrands(@RequestBody BrandFilterDTO filter) {
        List<BrandDTO> brandDTOList = brandService.getFilteredBrandDTOs(filter);
        return new ResponseEntity<>(brandDTOList, brandDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{brandId}")
    public ResponseEntity<Brand> getBrandById(@PathVariable Long brandId){
        Brand brand = brandService.getBrandById(brandId);
        return new ResponseEntity<>(brand, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Brand>> searchBrands(String keyword){
        List<Brand> matchingBrands = brandService.searchBrands(keyword);
        return new ResponseEntity<>(matchingBrands, matchingBrands.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Brand> createBrand(@RequestBody BrandDTO brandDTO) {
        Brand newBrand = brandService.createBrand(brandDTO);
        return new ResponseEntity<>(newBrand, HttpStatus.CREATED);
    }

    @PutMapping("/{brandId}")
    public ResponseEntity<Brand> updateProduct(@PathVariable Long brandId, @RequestBody BrandDTO brandDTO){
        Brand updatedBrand = brandService.updateBrand(brandId, brandDTO);
        return new ResponseEntity<>(updatedBrand, HttpStatus.OK);
    }

    @DeleteMapping("/{brandId}")
    public ResponseEntity<String> deleteBrand(@PathVariable Long brandId) {
        brandService.deleteBrand(brandId);
        return new ResponseEntity<>("Brand successfully deleted.", HttpStatus.OK);

    }
}
