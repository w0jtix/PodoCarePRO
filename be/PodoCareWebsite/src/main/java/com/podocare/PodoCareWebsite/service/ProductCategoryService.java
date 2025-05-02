package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.BrandDTO;
import com.podocare.PodoCareWebsite.DTO.CategoryDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.repo.ProductCategoryRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {
    private final ProductCategoryRepo productCategoryRepo;

    public CategoryDTO getCategoryById(Long categoryId){
        return new CategoryDTO(productCategoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with given id." + categoryId)));
    }

    public List<CategoryDTO> getCategories() {
        return productCategoryRepo.findAll()
                .stream()
                .map(CategoryDTO::new)
                .toList();
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryToCreate) {
        try{
            if(categoryAlreadyExists(categoryToCreate)) {
                throw new CreationException("Category already exists.");
            }
            return new CategoryDTO(productCategoryRepo.save(categoryToCreate.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create Category. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public CategoryDTO updateCategory(Long categoryId, CategoryDTO updatedCategory) {
        try{
            getCategoryById(categoryId);
            return new CategoryDTO(productCategoryRepo.save(updatedCategory.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Category, Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteCategoryById(Long categoryId) {
        try{
            productCategoryRepo.deleteById(getCategoryById(categoryId).getId());
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Category, Reason: " + e.getMessage(), e);
        }
    }

    private boolean categoryAlreadyExists(CategoryDTO categoryDTO) {
        return productCategoryRepo.findByCategoryName(categoryDTO.getName()).isPresent();
    }
}
