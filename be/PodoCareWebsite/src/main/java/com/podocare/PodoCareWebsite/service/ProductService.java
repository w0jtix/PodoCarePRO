package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.request.ProductFilterDTO;

import java.util.List;

public interface ProductService {

    ProductDTO getProductById(Long id);

    List<ProductDTO> getProducts(ProductFilterDTO filter);

    ProductDTO createProduct(ProductDTO product);

    List<ProductDTO> createProducts(List<ProductDTO> products);

    ProductDTO updateProduct(Long id, ProductDTO product);

    void deleteProductById(Long id);
}
