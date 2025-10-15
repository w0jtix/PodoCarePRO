package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.BaseServiceCategoryDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.BaseServiceCategory;
import com.podocare.PodoCareWebsite.repo.BaseServiceCategoryRepo;
import com.podocare.PodoCareWebsite.service.BaseServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BaseServiceCategoryServiceImpl implements BaseServiceCategoryService {
    private final BaseServiceCategoryRepo serviceCategoryRepo;

    @Override
    public BaseServiceCategoryDTO getCategoryById(Long id) {
        return new BaseServiceCategoryDTO(serviceCategoryRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with given id: " + id)));
    }

    @Override
    public List<BaseServiceCategoryDTO> getCategories() {
        return serviceCategoryRepo.findAll()
                .stream()
                .map(BaseServiceCategoryDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BaseServiceCategoryDTO createCategory(BaseServiceCategoryDTO category) {
        try{
            if(serviceCategoryRepo.existsByName(category.getName())) {
                throw new CreationException("Category already exists: " + category.getName());
            }
            return new BaseServiceCategoryDTO(serviceCategoryRepo.save(category.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create Category. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public BaseServiceCategoryDTO updateCategory(Long id, BaseServiceCategoryDTO category) {
        try{
            getCategoryById(id);

            checkForDuplicatesExcludingCurrent(category, id);
            category.setId(id);
            return new BaseServiceCategoryDTO(serviceCategoryRepo.save(category.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Category, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteCategoryById(Long id) {
        try{
            serviceCategoryRepo.deleteById(getCategoryById(id).getId());
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Category, Reason: " + e.getMessage(), e);
        }
    }

    private void checkForDuplicatesExcludingCurrent(BaseServiceCategoryDTO serviceCategoryDTO, Long currentId) {
        Optional<BaseServiceCategory> duplicate = serviceCategoryRepo.findByName(
                serviceCategoryDTO.getName()
        );

        if (duplicate.isPresent() && !duplicate.get().getId().equals(currentId)) {
            throw new UpdateException("Category with provided details already exists.");
        }
    }
}
