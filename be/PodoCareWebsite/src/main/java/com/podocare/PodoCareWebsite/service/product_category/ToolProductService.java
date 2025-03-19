package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.ToolProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.ToolProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ToolProductService{
    @Autowired
    private ToolProductRepo toolProductRepo;
    @Autowired
    private BrandService brandService;
    @Autowired
    private ToolProductInstanceRepo toolProductInstanceRepo;
    @Autowired
    @Lazy
    private ToolProductInstanceService toolProductInstanceService;


    public ToolProduct findByToolProductName(String productName){
        return toolProductRepo.findByToolProductName(productName)
                .orElseThrow(() -> new ProductNotFoundException("ToolProduct not found."));
    }

    public List<ToolProduct> getToolProducts() {
        return toolProductRepo.findAll();
    }

    public ToolProduct getToolProductWithActiveInstances(Long toolProductId) {
        ToolProduct toolProduct = getToolProductById(toolProductId);

        List<ToolProductInstance> activeInstances = toolProductInstanceRepo.findActiveInstancesByProductId(toolProductId);

        toolProduct.setProductInstances(activeInstances);
        return toolProduct;
    }

    public List<ToolProduct> getActiveToolProductsWithActiveInstances() {
        return toolProductRepo.findAllActiveWithActiveInstances();
    }

    public ToolProduct getToolProductById(Long toolProductId) {
        return toolProductRepo.findById(toolProductId)
                .orElseThrow(() -> new ProductNotFoundException("ToolProduct not found with ID: " + toolProductId));
    }

    public ToolProduct createToolProduct(ToolProductDTO toolProductDTO) {
        isValid(toolProductDTO.getProductName());

        if(toolProductAlreadyExists(toolProductDTO.getProductName())) {
            throw new ProductCreationException("Product already exists.");
        }
        ToolProduct toolProduct = new ToolProduct();
        ToolProduct toolProductToSave = toolProductDtoToToolProductConversion(toolProduct, toolProductDTO);

        try {
            ToolProduct savedProduct =  toolProductRepo.save(toolProductToSave);
            Long toolProductId = savedProduct.getId();

            if(toolProductDTO.getProductInstances() != null && !toolProductDTO.getProductInstances().isEmpty()) {
                for(ToolProductInstanceDTO instanceDTO : toolProductDTO.getProductInstances()) {
                    instanceDTO.setProductId(toolProductId);
                    toolProductInstanceService.createInstance(instanceDTO);
                }
            }

            return savedProduct;
        } catch (Exception e) {
            throw new ProductCreationException("Failed to create the Product."+ e.getMessage(), e);
        }
    }

    public ToolProduct updateToolProduct(Long toolProductId, ToolProductDTO toolProductDTO) {
        try {
            ToolProduct existingProduct = getToolProductById(toolProductId);
            boolean updated = false;

            if(toolProductDTO.getProductName() != null) {
                isValid(toolProductDTO.getProductName());
                existingProduct.setProductName(toolProductDTO.getProductName());
                updated = true;
            }
            if (toolProductDTO.getBrandName() != null) {
                existingProduct.setBrand(brandService.findOrCreateBrand(toolProductDTO.getBrandName()));
                updated = true;
            }
            if(toolProductDTO.getDescription() != null) {
                existingProduct.setDescription(toolProductDTO.getDescription());
                updated = true;
            }

            if (updated) {
                return toolProductRepo.save(existingProduct);
            }
            return existingProduct;
        } catch (Exception e) {
            throw new ProductCreationException("Failed to update existing Product.", e);
        }
    }

    @Transactional
    public void deleteToolProduct(Long toolProductId) {
        ToolProduct existingProduct = getToolProductById(toolProductId);

        toolProductInstanceService.hardDeleteAllInstances(existingProduct.getProductInstances());
        existingProduct.setIsDeleted(true);

        try{
            toolProductRepo.save(existingProduct);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public List<ToolProduct> searchToolProducts(String keyword) {
        return toolProductRepo.searchProducts(keyword);
    }

    public ToolProduct toolProductDtoToToolProductConversion(ToolProduct toolProduct, ToolProductDTO toolProductDTO){
        toolProduct.setProductName(toolProductDTO.getProductName());
        toolProduct.setBrand(brandService.findOrCreateBrand(toolProductDTO.getBrandName()));
        toolProduct.setInitialSupply(toolProductDTO.getInitialSupply() != null ? toolProductDTO.getInitialSupply() : 0);
        toolProduct.setCurrentSupply(toolProductDTO.getCurrentSupply() != null ? toolProductDTO.getCurrentSupply() : 0);
        toolProduct.setDescription(toolProductDTO.getDescription());
        return toolProduct;
    }

    public List<ToolProductInstance> getActiveInstances(Long toolProductId) {
        ToolProduct toolProduct = getToolProductById(toolProductId);
        List<ToolProductInstance> allInstances =  toolProduct.getProductInstances();

        return allInstances.stream().filter(ToolProductInstance::getIsAvailable).toList();
    }

    public List<ToolProductInstance> getAllInstances(Long toolProductId) {
        ToolProduct toolProduct = getToolProductById(toolProductId);
        return toolProduct.getProductInstances();
    }

    public boolean toolProductAlreadyExists(String toolProductName) {
        return toolProductRepo.findByToolProductName(toolProductName).isPresent();
    }

    private void isValid(String productName) {
        if(productName == null) {
            throw new ProductCreationException("ProductName cannot be null.");
        } else if (productName.length() < 2) {
            throw new ProductCreationException("ProductName requires 2+ characters.");
        }
    }
}
