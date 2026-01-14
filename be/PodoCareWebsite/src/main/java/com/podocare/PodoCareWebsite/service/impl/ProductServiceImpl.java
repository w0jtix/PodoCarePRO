package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.request.ProductFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Product;
import com.podocare.PodoCareWebsite.repo.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.ProductRepo;
import com.podocare.PodoCareWebsite.repo.SaleItemRepo;
import com.podocare.PodoCareWebsite.repo.UsageRecordRepo;
import com.podocare.PodoCareWebsite.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepo productRepo;
    private final OrderProductRepo orderProductRepo;
    private final SaleItemRepo saleItemRepo;
    private final UsageRecordRepo usageRecordRepo;

    @Override
    public ProductDTO getProductById(Long id) {
        return new ProductDTO(productRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with given id: " + id)));
    }

    @Override
    public List<ProductDTO> getProducts(ProductFilterDTO filter) {
        if(isNull(filter)) {
            filter = new ProductFilterDTO();
        }
        return  productRepo.findAllWithFilters(
                        filter.getProductIds(),
                        filter.getCategoryIds(),
                        filter.getBrandIds(),
                        filter.getKeyword(),
                        filter.getIncludeZero(),
                        filter.getIsDeleted())
                .stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductDTO> getProducts(ProductFilterDTO filter, int page, int size) {
        if(isNull(filter)) {
            filter = new ProductFilterDTO();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.asc("brand.name"), Sort.Order.asc("name")));

        Page<Product> products = productRepo.findAllWithFilters(
                filter.getProductIds(),
                filter.getCategoryIds(),
                filter.getBrandIds(),
                filter.getKeyword(),
                filter.getIncludeZero(),
                filter.getIsDeleted(),
                pageable);

        return products.map(ProductDTO::new);
    }

    @Override
    @Transactional
    public ProductDTO createProduct(ProductDTO product) {
        try{
            Optional<Product> existingProduct  = productRepo
                    .findByName(
                            product.getName()
                    );

            if (existingProduct.isPresent()) {
                Product existing = existingProduct.get();

                if (existing.getIsDeleted()) {
                    return restoreProduct(existing, product);
                } else {
                    throw new CreationException("Product already exists: " + product.getName());
                }
            }
            return new ProductDTO(productRepo.save(product.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create Product. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public List<ProductDTO> createProducts(List<ProductDTO> products) {
        return products.stream()
                .map(this::createProduct)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO product) {
        try {
            getProductById(id);

            checkForDuplicatesExcludingCurrent(product, id);
            product.setId(id);
            return new ProductDTO(productRepo.save(product.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Product, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteProductById(Long id) {
        try {
            Product product = productRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

            if (product.getIsDeleted()) {
                throw new DeletionException("Product is already softDeleted.");
            }
            if (hasOrderProductReferences(id) || hasSaleItemReferences(id) || hasUsageRecords(id)) {
                product.softDelete();
                productRepo.save(product);
            } else {
                productRepo.deleteById(id);
            }
        } catch (ResourceNotFoundException | DeletionException e) {
            throw e;
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Product, Reason: " + e.getMessage(), e);
        }
    }

    private void checkForDuplicatesExcludingCurrent(ProductDTO productDTO, Long currentId) {
        Optional<Product> duplicate = productRepo.findByName(
                productDTO.getName()
        );

        if (duplicate.isPresent() && !duplicate.get().getId().equals(currentId)) {
            if (duplicate.get().getIsDeleted()) {
                throw new UpdateException("Product with provided details already exists and is SoftDeleted.");
            } else {
                throw new UpdateException("Product with provided details already exists.");
            }
        }
    }

    private ProductDTO restoreProduct (Product deletedProduct, ProductDTO newProductData) {
        deletedProduct.restore(newProductData.getSupply());
        deletedProduct.setDescription(newProductData.getDescription());
        return new ProductDTO(productRepo.save(deletedProduct));
    }

    private boolean hasOrderProductReferences(Long productId) {
        return orderProductRepo.existsByProductId(productId);
    }

    private boolean hasSaleItemReferences(Long productId) {
        return saleItemRepo.existsByProductId(productId);
    }

    private boolean hasUsageRecords(Long productId) {
        return usageRecordRepo.existsByProductId((productId));
    }

}
