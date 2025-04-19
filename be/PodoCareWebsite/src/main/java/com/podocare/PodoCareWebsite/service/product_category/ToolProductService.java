package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.SaleProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.ToolProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.ToolProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.repo.order.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.ToolProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ToolProductService{
    @Autowired
    private ToolProductRepo toolProductRepo;
    @Autowired
    private BrandService brandService;
    @Autowired
    private OrderProductRepo orderProductRepo;
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

    public List<ToolProduct> getActiveToolProductsWithActiveInstances() {
        List<ToolProduct> products = toolProductRepo.findAllActiveToolProducts();
        for (ToolProduct product : products) {
            product.setProductInstances(getActiveInstances(product.getId())
            );
        }
        return products;
    }

    public ToolProduct getToolProductById(Long toolProductId) {
        return toolProductRepo.findById(toolProductId)
                .orElseThrow(() -> new ProductNotFoundException("ToolProduct not found with ID: " + toolProductId));
    }

    public ToolProduct getToolProductByIdNullable(Long toolProductId) {
        return toolProductRepo.findById(toolProductId)
                .orElse(null);
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
            if(toolProductDTO.getIsDeleted() != null) {
                existingProduct.setIsDeleted(toolProductDTO.getIsDeleted());
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

    public void deleteToolProduct(Long toolProductId) {
        try{
            toolProductRepo.deleteById(toolProductId);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public void softDeleteToolProduct(Long toolProductId) {
        try{
            ToolProduct existingProduct = getToolProductById(toolProductId);
            existingProduct.setIsDeleted(true);
            toolProductRepo.save(existingProduct);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public void deleteToolProductAndActiveInstances(Long toolProductId) {
        ToolProduct existingProduct = getToolProductById(toolProductId);
        boolean hasOrderProductReference = orderProductRepo.hasToolProductReference(toolProductId);

        List<ToolProductInstance> inactiveInstances = existingProduct.getProductInstances().stream()
                .filter(ToolProductInstance::getOutOfUse)
                .toList();

        toolProductInstanceService.hardDeleteAllActiveInstances(existingProduct.getProductInstances());

        try{
            if (inactiveInstances.isEmpty() && !hasOrderProductReference) {
                toolProductRepo.deleteById(toolProductId);
            } else {
                existingProduct.setIsDeleted(true);
                toolProductRepo.save(existingProduct);
            }
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

    public ToolProductDTO toolProductToToolProductDTOConversion(ToolProduct toolProduct, ToolProductDTO toolProductDTO) {
        toolProductDTO.setId(toolProduct.getId());
        toolProductDTO.setProductName(toolProduct.getProductName());
        toolProductDTO.setBrandName(toolProduct.getBrand().getBrandName());
        toolProductDTO.setInitialSupply(toolProduct.getInitialSupply());
        toolProductDTO.setCurrentSupply(toolProduct.getCurrentSupply());
        toolProductDTO.setDescription(toolProduct.getDescription());
        toolProductDTO.setCategory(toolProduct.getCategory());
        List<ToolProductInstanceDTO> instanceDTOList = new ArrayList<>();
        for(ToolProductInstance toolProductInstance : toolProduct.getProductInstances()) {
            ToolProductInstanceDTO toolProductInstanceDTO = new ToolProductInstanceDTO();
            instanceDTOList.add(
                    toolProductInstanceService.toolProductInstanceToToolProductInstanceDTO(toolProductInstance,toolProductInstanceDTO)
            );
        }
        toolProductDTO.setProductInstances(instanceDTOList);
        return toolProductDTO;
    }

    public List<ToolProductInstance> getActiveInstances(Long toolProductId) {
        ToolProduct toolProduct = getToolProductById(toolProductId);
        List<ToolProductInstance> allInstances =  toolProduct.getProductInstances();

        return allInstances.stream().filter(ToolProductInstance::getIsAvailable).toList();
    }

    public ToolProductDTO getToolProductDTOIncludeActiveInstances(Long productId){
        ToolProduct product = getToolProductById(productId);
        ToolProductDTO toolProductDTO = toolProductToToolProductDTOConversion(product, new ToolProductDTO());
        List<ToolProductInstanceDTO> activeInstanceDTOList = new ArrayList<>();
        for(ToolProductInstance toolProductInstance : getActiveInstances(productId)) {
            ToolProductInstanceDTO toolProductInstanceDTO = new ToolProductInstanceDTO();
            activeInstanceDTOList.add(
                    toolProductInstanceService.toolProductInstanceToToolProductInstanceDTO(toolProductInstance,toolProductInstanceDTO)
            );
        }
        toolProductDTO.setActiveProductInstances(activeInstanceDTOList);
        return toolProductDTO;
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
