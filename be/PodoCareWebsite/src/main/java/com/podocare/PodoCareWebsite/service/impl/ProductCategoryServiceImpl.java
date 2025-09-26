package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.BrandDTO;
import com.podocare.PodoCareWebsite.DTO.ProductCategoryDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Brand;
import com.podocare.PodoCareWebsite.model.ProductCategory;
import com.podocare.PodoCareWebsite.repo.ProductCategoryRepo;
import com.podocare.PodoCareWebsite.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements ProductCategoryService {
    private final ProductCategoryRepo productCategoryRepo;

    @Override
    public ProductCategoryDTO getCategoryById(Long id){
        return new ProductCategoryDTO(productCategoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with given id: " + id)));
    }

    @Override
    public List<ProductCategoryDTO> getCategories() {
        return productCategoryRepo.findAll()
                .stream()
                .map(ProductCategoryDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductCategoryDTO createCategory(ProductCategoryDTO category) {
        try{
            if(categoryAlreadyExists(category)) {
                throw new CreationException("Category already exists: " + category.getName());
            }
            return new ProductCategoryDTO(productCategoryRepo.save(category.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create Category. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ProductCategoryDTO updateCategory(Long id, ProductCategoryDTO category) {
        try{
            getCategoryById(id);

            checkForDuplicatesExcludingCurrent(category, id);
            category.setId(id);
            return new ProductCategoryDTO(productCategoryRepo.save(category.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Category, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteCategoryById(Long id) {
        try{
            productCategoryRepo.deleteById(getCategoryById(id).getId());
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Category, Reason: " + e.getMessage(), e);
        }
    }

    private boolean categoryAlreadyExists(ProductCategoryDTO categoryDTO) {
        return productCategoryRepo.findByCategoryName(categoryDTO.getName()).isPresent();
    }

    private void checkForDuplicatesExcludingCurrent(ProductCategoryDTO productCategoryDTO, Long currentId) {
        Optional<ProductCategory> duplicate = productCategoryRepo.findByCategoryName(
                productCategoryDTO.getName()
        );

        if (duplicate.isPresent() && !duplicate.get().getId().equals(currentId)) {
            throw new UpdateException("Category with provided details already exists.");
        }
    }
}
