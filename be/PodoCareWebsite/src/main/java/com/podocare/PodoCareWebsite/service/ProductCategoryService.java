package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.ProductCategoryDTO;

import java.util.List;

public interface ProductCategoryService {

    ProductCategoryDTO getCategoryById(Long id);

    List<ProductCategoryDTO> getCategories();

    ProductCategoryDTO createCategory(ProductCategoryDTO category);

    ProductCategoryDTO updateCategory(Long id, ProductCategoryDTO category);

    void deleteCategoryById(Long id);

}
