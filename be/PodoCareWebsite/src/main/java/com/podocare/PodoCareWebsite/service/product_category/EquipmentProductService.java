package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.EquipmentProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.repo.product_category.EquipmentProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.EquipmentProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EquipmentProductService {

    @Autowired
    private EquipmentProductRepo equipmentProductRepo;
    @Autowired
    private BrandService brandService;
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

    public EquipmentProduct getEquipmentProductWithActiveInstances(Long equipmentProductId) {
        EquipmentProduct equipmentProduct = getEquipmentProductById(equipmentProductId);

        List<EquipmentProductInstance> activeInstances = equipmentProductInstanceRepo.findActiveInstancesByProductId(equipmentProductId);

        equipmentProduct.setProductInstances(activeInstances);
        return equipmentProduct;
    }

    public List<EquipmentProduct> getActiveEquipmentProductsWithActiveInstances() {
        return equipmentProductRepo.findAllActiveWithActiveInstances();
    }

    public EquipmentProduct getEquipmentProductById(Long equipmentProductId) {
        return equipmentProductRepo.findById(equipmentProductId)
                .orElseThrow(() -> new ProductNotFoundException("EquipmentProduct not found with ID: " + equipmentProductId));
    }


    public EquipmentProduct createEquipmentProduct(EquipmentProductDTO equipmentProductDTO) {
        isValid(equipmentProductDTO.getProductName());

        if(equipmentProductAlreadyExists(equipmentProductDTO.getProductName())) {
            throw new ProductCreationException("Product already exists.");
        }
        EquipmentProduct equipmentProduct = new EquipmentProduct();
        EquipmentProduct equipmentProductToSave = equipmentProductDtoToEquipmentProductConversion(equipmentProduct, equipmentProductDTO);

        try {
            return equipmentProductRepo.save(equipmentProductToSave);
        } catch (Exception e) {
            throw new ProductCreationException("Failed to create the Product.", e);
        }
    }

    public EquipmentProduct updateEquipmentProduct(Long equipmentProductId, EquipmentProductDTO equipmentProductDTO) {
        EquipmentProduct existingProduct = getEquipmentProductById(equipmentProductId);

        isValid(equipmentProductDTO.getProductName());
        EquipmentProduct equipmentProductToUpdate = equipmentProductDtoToEquipmentProductConversion(existingProduct, equipmentProductDTO);

        try {
            return equipmentProductRepo.save(equipmentProductToUpdate);
        } catch (Exception e) {
            throw new ProductCreationException("Failed to update existing Product.", e);
        }
    }

    @Transactional
    public void deleteEquipmentProduct(Long equipmentProductId) {
        EquipmentProduct existingProduct = getEquipmentProductById(equipmentProductId);

        equipmentProductInstanceService.batchDeleteInstancesByProduct(existingProduct);
        existingProduct.setIsDeleted(true);

        try{
            equipmentProductRepo.save(existingProduct);
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





