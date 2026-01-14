package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.BaseServiceCategoryDTO;

import java.util.List;

public interface BaseServiceCategoryService {

    BaseServiceCategoryDTO getCategoryById(Long id);

    List<BaseServiceCategoryDTO> getCategories();

    BaseServiceCategoryDTO createCategory(BaseServiceCategoryDTO category);

    BaseServiceCategoryDTO updateCategory(Long id, BaseServiceCategoryDTO category);

    void deleteCategoryById(Long id);
}
