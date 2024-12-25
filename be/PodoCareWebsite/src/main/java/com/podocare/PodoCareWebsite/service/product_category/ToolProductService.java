package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.ToolProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
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

        if(toolProductAlreadyExists(toolProductDTO)) {
            throw new ProductCreationException("Product already exists.");
        }
        ToolProduct toolProduct = new ToolProduct();
        ToolProduct toolProductToSave = toolProductDtoToToolProductConversion(toolProduct, toolProductDTO);

        try {
            return toolProductRepo.save(toolProductToSave);
        } catch (Exception e) {
            throw new ProductCreationException("Failed to create the Product.", e);
        }
    }

    public ToolProduct updateToolProduct(Long toolProductId, ToolProductDTO toolProductDTO) {
        ToolProduct existingProduct = getToolProductById(toolProductId);

        isValid(toolProductDTO.getProductName());
        ToolProduct toolProductToUpdate = toolProductDtoToToolProductConversion(existingProduct, toolProductDTO);

        try {
            return toolProductRepo.save(toolProductToUpdate);
        } catch (Exception e) {
            throw new ProductCreationException("Failed to update existing Product.", e);
        }
    }

    @Transactional
    public void deleteToolProduct(Long toolProductId) {
        ToolProduct existingProduct = getToolProductById(toolProductId);

        toolProductInstanceService.batchDeleteInstancesByProduct(existingProduct);
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
        toolProduct.setInitialSupply(toolProductDTO.getInitialSupply());
        toolProduct.setCurrentSupply(toolProductDTO.getCurrentSupply());
        toolProduct.setDescription(toolProductDTO.getDescription());
        return toolProduct;
    }

    private boolean toolProductAlreadyExists(ToolProductDTO toolProductDTO) {
        return toolProductRepo.findByToolProductName(toolProductDTO.getProductName()).isPresent();
    }

    private void isValid(String productName) {
        if(productName == null) {
            throw new ProductCreationException("ProductName cannot be null.");
        } else if (productName.length() < 2) {
            throw new ProductCreationException("ProductName requires 2+ characters.");
        }
    }
}
