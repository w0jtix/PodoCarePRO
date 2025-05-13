package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Product;
import com.podocare.PodoCareWebsite.repo.ProductRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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

    public ProductDisplayDTO getProductDisplayById(Long productId) {
        return productRepo.findProductDisplayById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with given id." + productId));
    }

    public List<ProductDisplayDTO> getProducts(FilterDTO filter) {
        if(isNull(filter)) {
            filter = new FilterDTO();
        }
        return productRepo.findAllWithFilters(
                filter.getCategoryIds(), filter.getBrandIds(), filter.getKeyword(), filter.getIncludeZero()) ;
    }

    @Transactional
    public ProductDisplayDTO createProduct(ProductRequestDTO productToCreate) {
        try{
            Optional<ProductDTO> existingProductOptional = productRepo.findByProductName(productToCreate.getName());
            if (existingProductOptional.isPresent()) { // sprawdzic czy productToCreate.brand == exisitng.brand ??
                ProductDTO existingProductDTO = existingProductOptional.get();
                if(Boolean.FALSE.equals(existingProductDTO.getIsDeleted())){
                    throw new CreationException("Product already exists: " + productToCreate.getName());
                } else {
                    productToCreate.setId(existingProductDTO.getId());
                    return this.updateProduct(existingProductDTO.getId(), productToCreate);
                }
            }
            Product savedProduct = productRepo.save(productToCreate.toEntity());
            supplyManagerService.createManager(savedProduct.getId(), productToCreate.getSupply());
            return getProductDisplayById(savedProduct.getId());
        } catch (Exception e) {
            throw new CreationException("Failed to create Product. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public List<ProductDisplayDTO> createProducts(List<ProductRequestDTO> productsToCreate) {
        return productsToCreate.stream()
                .map(this::createProduct)
                .toList();
    }

    @Transactional
    public ProductDisplayDTO updateProduct(Long productId, ProductRequestDTO updatedProduct) {
        try {
            getProductById(productId);
            supplyManagerService.changeSupply(
                    new SupplyManagerDTO(
                            updatedProduct.getId(),
                            updatedProduct.getSupply()
                    )
            );
            Product savedProduct = productRepo.save(updatedProduct.toEntity());
            return getProductDisplayById(savedProduct.getId());
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

}
