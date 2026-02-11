package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.BaseServiceCategoryDTO;
import com.podocare.PodoCareWebsite.service.BaseServiceCategoryService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service-categories")
public class BaseServiceCategoryController {

    private final BaseServiceCategoryService serviceCategoryService;

    @GetMapping("/all")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<BaseServiceCategoryDTO>> getCategories() {
        List<BaseServiceCategoryDTO> categoryDTOList = serviceCategoryService.getCategories();
        return new ResponseEntity<>(categoryDTOList, categoryDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<BaseServiceCategoryDTO> getCategoryById(@PathVariable(value = "id") Long id){
        BaseServiceCategoryDTO category = serviceCategoryService.getCategoryById(id);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<BaseServiceCategoryDTO> createCategory(@NonNull @RequestBody BaseServiceCategoryDTO category) {
        BaseServiceCategoryDTO newCategory = serviceCategoryService.createCategory(category);
        return new ResponseEntity<>(newCategory, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<BaseServiceCategoryDTO> updateCategory(@PathVariable(value = "id") Long id, @NonNull @RequestBody BaseServiceCategoryDTO category){
        BaseServiceCategoryDTO saved = serviceCategoryService.updateCategory(id, category);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<Void> deleteCategory(@PathVariable(value = "id") Long id) {
        serviceCategoryService.deleteCategoryById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
