package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.EquipmentProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.SaleProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.ToolProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.repo.order.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.EquipmentProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.EquipmentProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EquipmentProductService {

    @Autowired
    private EquipmentProductRepo equipmentProductRepo;
    @Autowired
    private BrandService brandService;
    @Autowired
    private OrderProductRepo orderProductRepo;
    @Autowired
    private EquipmentProductInstanceRepo equipmentProductInstanceRepo;
    @Autowired
    @Lazy
    private EquipmentProductInstanceService equipmentProductInstanceService;


    public EquipmentProduct findByEquipmentProductName(String productName){
        return equipmentProductRepo.findByEquipmentProductName(productName)
                .orElseThrow(() -> new ProductNotFoundException("EquipmentProduct not found."));
    }

    public List<EquipmentProduct> getEquipmentProducts() {
        return equipmentProductRepo.findAll();
    }

    public List<EquipmentProduct> getActiveEquipmentProductsWithActiveInstances() {
        List<EquipmentProduct> products = equipmentProductRepo.findAllActiveEquipmentProducts();
        for (EquipmentProduct product : products) {
            product.setProductInstances(getActiveInstances(product.getId())
            );
        }
        return products;
    }

    public EquipmentProduct getEquipmentProductById(Long equipmentProductId) {
        return equipmentProductRepo.findById(equipmentProductId)
                .orElseThrow(() -> new ProductNotFoundException("EquipmentProduct not found with ID: " + equipmentProductId));
    }

    public EquipmentProduct getEquipmentProductByIdNullable(Long equipmentProductId){
        return equipmentProductRepo.findById(equipmentProductId)
                .orElse(null);
    }

    public EquipmentProduct createEquipmentProduct(EquipmentProductDTO equipmentProductDTO) {
        isValid(equipmentProductDTO.getProductName());

        if(equipmentProductAlreadyExists(equipmentProductDTO.getProductName())) {
            throw new ProductCreationException("Product already exists.");
        }
        EquipmentProduct equipmentProduct = new EquipmentProduct();
        EquipmentProduct equipmentProductToSave = equipmentProductDtoToEquipmentProductConversion(equipmentProduct, equipmentProductDTO);

        try {
            EquipmentProduct savedProduct =  equipmentProductRepo.save(equipmentProductToSave);
            Long equipmentProductId = savedProduct.getId();

            if(equipmentProductDTO.getProductInstances() != null && !equipmentProductDTO.getProductInstances().isEmpty()) {
                for(EquipmentProductInstanceDTO instanceDTO : equipmentProductDTO.getProductInstances()) {
                    instanceDTO.setProductId(equipmentProductId);
                    equipmentProductInstanceService.createInstance(instanceDTO);
                }
            }
            return savedProduct;
        } catch (Exception e) {
            throw new ProductCreationException("Failed to create the Product."+ e.getMessage(), e);
        }
    }

    public EquipmentProduct updateEquipmentProduct(Long equipmentProductId, EquipmentProductDTO equipmentProductDTO) {
        try{
            EquipmentProduct existingProduct = getEquipmentProductById(equipmentProductId);
            boolean updated = false;
            if(equipmentProductDTO.getProductName() != null) {
                isValid(equipmentProductDTO.getProductName());
                existingProduct.setProductName(equipmentProductDTO.getProductName());
            }
            if (equipmentProductDTO.getBrandName() != null) {
                existingProduct.setBrand(brandService.findOrCreateBrand(equipmentProductDTO.getBrandName()));
                updated = true;
            }
            if(equipmentProductDTO.getDescription() != null) {
                existingProduct.setDescription(equipmentProductDTO.getDescription());
                updated = true;
            }
            if(equipmentProductDTO.getWarrantyLength() != null) {
                existingProduct.setWarrantyLength(equipmentProductDTO.getWarrantyLength());
                updated = true;
            }
            if(equipmentProductDTO.getIsDeleted() != null) {
                existingProduct.setIsDeleted(equipmentProductDTO.getIsDeleted());
                updated = true;
            }
            if (updated) {
                return equipmentProductRepo.save(existingProduct);
            }
            return existingProduct;
        } catch (Exception e) {
            throw new ProductCreationException("Failed to update existing Product.", e);
        }
    }

    public void hardDeleteEquipmentProduct(Long equipmentProductId) {
        try{
            equipmentProductRepo.deleteById(equipmentProductId);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public void deleteEquipmentProduct(Long equipmentProductId) {
        try{
            equipmentProductRepo.deleteById(equipmentProductId);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public void softDeleteEquipmentProduct(Long equipmentProductId) {
        try{
            EquipmentProduct existingProduct = getEquipmentProductById(equipmentProductId);
            existingProduct.setIsDeleted(true);
            equipmentProductRepo.save(existingProduct);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public void deleteEquipmentProductAndActiveInstances(Long equipmentProductId) {
        EquipmentProduct existingProduct = getEquipmentProductById(equipmentProductId);
        boolean hasOrderProductReference = orderProductRepo.hasEquipmentProductReference(equipmentProductId);

        List<EquipmentProductInstance> inactiveInstances = existingProduct.getProductInstances().stream()
                .filter(EquipmentProductInstance::getOutOfUse)
                .toList();

        equipmentProductInstanceService.hardDeleteAllActiveInstances(existingProduct.getProductInstances());

        try{
            if (inactiveInstances.isEmpty() && !hasOrderProductReference) {
                equipmentProductRepo.deleteById(equipmentProductId);
            } else {
                existingProduct.setIsDeleted(true);
                equipmentProductRepo.save(existingProduct);
            }
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public List<EquipmentProduct> searchEquipmentProducts(String keyword) {
        return equipmentProductRepo.searchProducts(keyword);
    }

    public EquipmentProduct equipmentProductDtoToEquipmentProductConversion(EquipmentProduct equipmentProduct, EquipmentProductDTO equipmentProductDTO){
        equipmentProduct.setProductName(equipmentProductDTO.getProductName());
        equipmentProduct.setBrand(brandService.findOrCreateBrand(equipmentProductDTO.getBrandName()));
        equipmentProduct.setInitialSupply(equipmentProductDTO.getInitialSupply() != null ? equipmentProductDTO.getInitialSupply() : 0);
        equipmentProduct.setCurrentSupply(equipmentProductDTO.getCurrentSupply() != null ? equipmentProductDTO.getCurrentSupply() : 0);
        equipmentProduct.setDescription(equipmentProductDTO.getDescription());
        equipmentProduct.setWarrantyLength(equipmentProductDTO.getWarrantyLength() != null ? equipmentProductDTO.getWarrantyLength() : 24);
        return equipmentProduct;
    }

    public EquipmentProductDTO equipmentProductToEquipmentProductDTOConversion(EquipmentProduct equipmentProduct, EquipmentProductDTO equipmentProductDTO) {
        equipmentProductDTO.setId(equipmentProduct.getId());
        equipmentProductDTO.setProductName(equipmentProduct.getProductName());
        equipmentProductDTO.setBrandName(equipmentProduct.getBrand().getBrandName());
        equipmentProductDTO.setInitialSupply(equipmentProduct.getInitialSupply());
        equipmentProductDTO.setCurrentSupply(equipmentProduct.getCurrentSupply());
        equipmentProductDTO.setDescription(equipmentProduct.getDescription());
        equipmentProductDTO.setWarrantyLength(equipmentProduct.getWarrantyLength());
        equipmentProductDTO.setCategory(equipmentProduct.getCategory());
        List<EquipmentProductInstanceDTO> instanceDTOList = new ArrayList<>();
        for(EquipmentProductInstance equipmentProductInstance : equipmentProduct.getProductInstances()) {
            EquipmentProductInstanceDTO equipmentProductInstanceDTO = new EquipmentProductInstanceDTO();
            instanceDTOList.add(
                    equipmentProductInstanceService.equipmentProductInstanceToEquipmentProductInstanceDTO(equipmentProductInstance,equipmentProductInstanceDTO)
            );
        }
        equipmentProductDTO.setProductInstances(instanceDTOList);
        return equipmentProductDTO;
    }

    public List<EquipmentProductInstance> getActiveInstances(Long equipmentProductId) {
        EquipmentProduct equipmentProduct = getEquipmentProductById(equipmentProductId);
        List<EquipmentProductInstance> allInstances =  equipmentProduct.getProductInstances();

        return allInstances.stream().filter(EquipmentProductInstance::getIsAvailable).toList();
    }

    public EquipmentProductDTO getEquipmentProductDTOIncludeActiveInstances(Long productId){
        EquipmentProduct product = getEquipmentProductById(productId);
        EquipmentProductDTO equipmentProductDTO = equipmentProductToEquipmentProductDTOConversion(product, new EquipmentProductDTO());
        List<EquipmentProductInstanceDTO> activeInstanceDTOList = new ArrayList<>();
        for(EquipmentProductInstance equipmentProductInstance : getActiveInstances(productId)) {
            EquipmentProductInstanceDTO equipmentProductInstanceDTO = new EquipmentProductInstanceDTO();
            activeInstanceDTOList.add(
                    equipmentProductInstanceService.equipmentProductInstanceToEquipmentProductInstanceDTO(equipmentProductInstance,equipmentProductInstanceDTO)
            );
        }
        equipmentProductDTO.setActiveProductInstances(activeInstanceDTOList);
        return equipmentProductDTO;
    }

    public List<EquipmentProductInstance> getAllInstances(Long equipmentProductId) {
        EquipmentProduct equipmentProduct = getEquipmentProductById(equipmentProductId);
        return equipmentProduct.getProductInstances();
    }

    public boolean equipmentProductAlreadyExists(String equipmentProductName) {
        return equipmentProductRepo.findByEquipmentProductName(equipmentProductName).isPresent();
    }

    private void isValid(String productName) {
        if(productName == null) {
            throw new ProductCreationException("ProductName cannot be null.");
        } else if (productName.length() < 2) {
            throw new ProductCreationException("ProductName requires 2+ characters.");
        }
    }

}





