package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ProductCategoryDTO;
import com.podocare.PodoCareWebsite.service.ProductCategoryService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.Objects.nonNull;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class ProductCategoryController {
    private final ProductCategoryService productCategoryService;

    @PostMapping("/search")
    public ResponseEntity<List<ProductCategoryDTO>> getCategories() {
        List<ProductCategoryDTO> categoryDTOList = productCategoryService.getCategories();
        return new ResponseEntity<>(categoryDTOList, categoryDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductCategoryDTO> getCategoryById(@PathVariable(value = "id") Long id){
        ProductCategoryDTO category = productCategoryService.getCategoryById(id);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ProductCategoryDTO> createCategory(@NonNull @RequestBody ProductCategoryDTO category) {
        ProductCategoryDTO newCategory = productCategoryService.createCategory(category);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductCategoryDTO> updateCategory(@PathVariable(value = "id") Long id, @NonNull @RequestBody ProductCategoryDTO category){
        ProductCategoryDTO saved = productCategoryService.updateCategory(id, category);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable(value = "id") Long id) {
        productCategoryService.deleteCategoryById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
