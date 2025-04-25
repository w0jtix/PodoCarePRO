package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.repo.ProductRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepo productRepo;
    private final SupplyManagerService supplyManagerService;

    public ProductDTO getProductById(Long productId) {
        return new ProductDTO(productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with given id." + productId)));
    }

    public List<ProductDTO> getProducts(FilterDTO filter) {
        if(isNull(filter)) {
            filter = new FilterDTO();
        }

        return productRepo.findAllWithFilters(
                filter.getCategories(), filter.getBrandIds(), filter.getKeyword(), filter.getAvailable())
                .stream()
                .map(ProductDTO::new)
                .toList();
    }

    @Transactional
    public List<ProductDTO> createProducts(List<ProductDTO> productsToCreate) {
        try {
            for (ProductDTO product : productsToCreate) {
                if (productAlreadyExists(product)) {
                    throw new CreationException("Product already exists: " + product.getProductName());
                }
            }
            return productsToCreate.stream()
                    .map(ProductDTO::toEntity)
                    .map(productRepo::save)
                    .peek(savedProduct -> supplyManagerService.createManager(savedProduct.getId()))
                    .map(ProductDTO::new)
                    .toList();
        } catch (Exception e) {
            throw new CreationException("Failed to create Product. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ProductDTO updateProduct(Long productId, ProductDTO updatedProduct) {
        try {
            getProductById(productId);
            return new ProductDTO(productRepo.save(updatedProduct.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Product, Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteProductById(Long productId) {
        try {
           productRepo.deleteById(getProductById(productId).getId());
           supplyManagerService.deleteManagerByProductId(productId);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Product, Reason: " + e.getMessage(), e);
        }
    }

    private boolean productAlreadyExists(ProductDTO productDTO) {
        return productRepo.findByProductName(productDTO.getProductName()).isPresent();
    }
}
