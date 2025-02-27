package com.podocare.PodoCareWebsite.service.product_category.product_instances;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceUpdateException;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.product.product_category.*;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.ToolProductInstanceRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.ToolProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import com.podocare.PodoCareWebsite.service.order.SupplierService;
import com.podocare.PodoCareWebsite.service.product_category.ToolProductService;
import com.podocare.PodoCareWebsite.service.product_category.ToolProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class ToolProductInstanceService {

    @Autowired
    private ToolProductInstanceRepo toolProductInstanceRepo;
    @Autowired
    private ToolProductRepo toolProductRepo;
    @Autowired
    private SupplierService supplierService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    @Lazy
    private OrderService orderService;

    public ToolProductInstance getToolProductInstanceById(Long toolProductInstanceId) {
        return toolProductInstanceRepo.findById(toolProductInstanceId)
                .orElseThrow(() -> new ProductInstanceNotFoundException("ToolProductInstance not found with id: " + toolProductInstanceId));
    }

    public List<ToolProductInstance> getToolProductInstancesByToolProductId(Long toolProductId){
        toolProductService.getToolProductById(toolProductId);
        return toolProductInstanceRepo.findByToolProductId(toolProductId);
    }

    public ToolProductInstance createInstance(ToolProductInstanceDTO toolProductInstanceDTO){
        validateToolProductInstanceDTO(toolProductInstanceDTO);

        ToolProductInstance toolProductInstance = new ToolProductInstance();
        ToolProductInstance toolProductInstanceToSave = toolProductInstanceDtoToToolProductInstanceConversion(toolProductInstance, toolProductInstanceDTO);

        try {
            toolProductInstanceRepo.save(toolProductInstanceToSave);
            incrementCurrentSupply(toolProductInstanceToSave.getToolProduct());
        } catch (Exception e) {
            throw new ProductInstanceCreationException("Failed to create ToolProductInstance.", e);
        }

        return toolProductInstanceToSave;
    }

    public ToolProductInstance createIndependentInstance(ToolProductInstanceDTO toolProductInstanceDTO){
        validateIndependentToolProductInstanceDTO(toolProductInstanceDTO);
        ToolProductInstance toolProductInstance = new ToolProductInstance();
        ToolProductInstance toolProductInstanceToSave =toolProductInstanceDtoToIndependentToolProductInstanceConversion(toolProductInstance, toolProductInstanceDTO);
        try {
            toolProductInstanceRepo.save(toolProductInstanceToSave);
            incrementCurrentSupply(toolProductInstanceToSave.getToolProduct());
        } catch(Exception e) {
            throw new ProductInstanceCreationException("Failed to create ToolProductInstance.", e);
        }

        return toolProductInstanceToSave;
    }

    @Transactional
    public ToolProductInstance updateInstance(Long toolProductInstanceId,
                                              ToolProductInstanceDTO toolProductInstanceDTO){
        ToolProductInstance existingToolProductInstance =  getToolProductInstanceById(toolProductInstanceId);
        validateToolProductInstanceDTO(toolProductInstanceDTO);
        ToolProductInstance toolProductInstanceToUpdate = toolProductInstanceDtoToToolProductInstanceConversion(existingToolProductInstance, toolProductInstanceDTO);

        boolean wasActive = !existingToolProductInstance.getOutOfUse();
        boolean isNowActive = !toolProductInstanceToUpdate.getOutOfUse();
        ToolProduct toolProduct = toolProductInstanceToUpdate.getToolProduct();

        try {
            toolProductInstanceRepo.save(toolProductInstanceToUpdate);
            if (wasActive && !isNowActive) {
                decrementCurrentSupply(toolProduct);
            } else if (!wasActive && isNowActive) {
                incrementCurrentSupply(toolProduct);
            }
        } catch (Exception e) {
            log.error("Failed to update ToolProductInstance or currentSupply for Product ID: {}", toolProduct.getId(), e);
            throw new ProductInstanceUpdateException("Error occurred while updating ToolProductInstance.", e);
        }

        return toolProductInstanceToUpdate;
    }

    @Transactional
    public void deleteInstance(Long toolProductInstanceId){
        ToolProductInstance existingToolProductInstance =  getToolProductInstanceById(toolProductInstanceId);

        boolean isActive = !existingToolProductInstance.getOutOfUse() && !existingToolProductInstance.getIsDeleted();

        existingToolProductInstance.setIsDeleted(true);

        try{
            toolProductInstanceRepo.save(existingToolProductInstance);
            if(isActive) {
                decrementCurrentSupply(existingToolProductInstance.getToolProduct());
            }
        } catch (Exception e) {
            log.error("Failed to soft delete ToolProductInstance ID: {}", toolProductInstanceId, e);
            throw new ProductInstanceDeletionException("Failed to soft delete ToolProductInstance.", e);
        }
    }

    @Transactional
    public void hardDeleteInstance(Long toolProductInstanceId) {
        ToolProductInstance existingToolProductInstance =  getToolProductInstanceById(toolProductInstanceId);

        boolean wasSoftDeleted = !existingToolProductInstance.getIsDeleted();
        boolean isActive = !existingToolProductInstance.getOutOfUse() && !wasSoftDeleted;

        try {
            toolProductInstanceRepo.deleteById(toolProductInstanceId);
            if(isActive) {
                decrementCurrentSupply(existingToolProductInstance.getToolProduct());
            }
        } catch (Exception e) {
            log.error("Failed to soft delete ToolProductInstance ID: {}", toolProductInstanceId, e);
            throw new ProductInstanceDeletionException("Failed to hard delete ToolProductInstance.", e);
        }
    }

    @Transactional
    public void hardDeleteAllInstances(List<ToolProductInstance> toolProductInstances) {
        if(toolProductInstances == null || toolProductInstances.isEmpty()) {
            return;
        }

        long activeCount = toolProductInstances.stream()
                .filter(instance -> !instance.getOutOfUse() && !instance.getIsDeleted())
                .count();

        ToolProduct toolProduct = toolProductInstances.getFirst().getToolProduct();

        try{
            toolProductInstanceRepo.deleteAll(toolProductInstances);
            if(activeCount > 0){
                decrementCurrentSupplyByAmount(toolProduct, (int) activeCount);
            }
        } catch (Exception e) {
            throw new ProductInstanceDeletionException("Failed to batch hard delete ToolProductInstances.", e);
        }
    }

    @Transactional
    public void batchDeleteInstancesByProduct(ToolProduct toolProduct) {

        List<ToolProductInstance> toolProductInstances = toolProduct.getProductInstances();

        long activeCount = toolProductInstances.stream()
                .filter(instance -> !instance.getOutOfUse() && !instance.getIsDeleted())
                .count();

        List<Long> instanceIds = toolProductInstances.stream()
                .map(ToolProductInstance::getId)
                .toList();
        try {
            toolProductInstanceRepo.markInstancesAsDeletedByIds(instanceIds);
            if(activeCount > 0){
                decrementCurrentSupplyByAmount(toolProduct, (int) activeCount);
            }
        } catch (Exception e) {
            throw new ProductInstanceDeletionException("Failed to batch soft delete ToolProductInstances.", e);
        }
    }


    public ToolProductInstance toolProductInstanceDtoToToolProductInstanceConversion(ToolProductInstance toolProductInstance,
                                                                                     ToolProductInstanceDTO toolProductInstanceDTO){
        toolProductInstance.setToolProduct(toolProductService.getToolProductById(toolProductInstanceDTO.getToolProductId()));
        toolProductInstance.setSupplier(supplierService.findOrCreateSupplier(supplierService.getSupplierById(toolProductInstanceDTO.getSupplierId()).getSupplierName()));
        toolProductInstance.setOrder(orderService.findOrderByOrderNumber(toolProductInstanceDTO.getOrderNumber()));
        toolProductInstance.setPurchaseDate(toolProductInstanceDTO.getPurchaseDate());
        toolProductInstance.setPurchasePrice(toolProductInstanceDTO.getPurchasePrice());
        toolProductInstance.setVatRate(toolProductInstanceDTO.getVatRate());
        toolProductInstance.setNetPrice(toolProductInstanceDTO.getNetPrice());
        toolProductInstance.setDescription(toolProductInstanceDTO.getDescription());
        toolProductInstance.setOutOfUse(toolProductInstanceDTO.getOutOfUse() != null ? toolProductInstanceDTO.getOutOfUse() : false);
        return toolProductInstance;
    }

    public ToolProductInstance toolProductInstanceDtoToIndependentToolProductInstanceConversion(ToolProductInstance toolProductInstance,
                                                                                                ToolProductInstanceDTO toolProductInstanceDTO){
        toolProductInstance.setToolProduct(toolProductService.getToolProductById(toolProductInstanceDTO.getToolProductId()));
        toolProductInstance.setPurchasePrice(toolProductInstanceDTO.getPurchasePrice());
        toolProductInstance.setVatRate(toolProductInstanceDTO.getVatRate());
        toolProductInstance.setNetPrice(toolProductInstanceDTO.getNetPrice());
        toolProductInstance.setDescription(toolProductInstanceDTO.getDescription());
        if (toolProductInstanceDTO.getPurchaseDate() == null) {
            toolProductInstance.setPurchaseDate(new Date());
        } else {
            toolProductInstance.setPurchaseDate(toolProductInstanceDTO.getPurchaseDate());
        }
        return toolProductInstance;
    }

    public Long countToolProductInstancesAvailable(Long toolProductId) {
        ToolProduct existingProduct = toolProductService.getToolProductById(toolProductId);
        return toolProductInstanceRepo.countAvailableInstances();
    }

    public void incrementCurrentSupply (ToolProduct toolProduct) {
        toolProduct.setCurrentSupply(toolProduct.getCurrentSupply() +1);
        try {
            toolProductRepo.save(toolProduct);
        } catch (Exception e) {
            throw new ProductUpdateException("Failed to save updated ToolProduct.", e);
        }
    }

    public void decrementCurrentSupply (ToolProduct toolProduct) {
        if(toolProduct.getCurrentSupply() > 0) {
            toolProduct.setCurrentSupply(toolProduct.getCurrentSupply() - 1);
            try {
                toolProductRepo.save(toolProduct);
            } catch (Exception e) {
                throw new ProductUpdateException("Failed to save updated ToolProduct.", e);
            }
        } else {
            throw new IllegalStateException("CurrentSupply cannot be negative");
        }
    }

    public void decrementCurrentSupplyByAmount(ToolProduct toolProduct, int amount){
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount to decrement must be greater than zero.");
        }
        if (toolProduct.getCurrentSupply() < amount) {
            throw new IllegalStateException("CurrentSupply cannot be negative.");
        }

        toolProduct.setCurrentSupply(toolProduct.getCurrentSupply() - amount);
        try {
            toolProductRepo.save(toolProduct);
        } catch (Exception e) {
            throw new ProductUpdateException("Failed to save updated ToolProduct.", e);
        }
    }



    private void isValid(ToolProductInstanceDTO toolProductInstanceDTO) {
        if (toolProductInstanceDTO.getPurchasePrice() < 0) {
            throw new ProductInstanceCreationException("PurchasePrice cannot be negative.");
        }
    }

    public void validateToolProductInstanceDTO(ToolProductInstanceDTO toolProductInstanceDTO) {
        if (toolProductInstanceDTO.getToolProductId() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid toolProductName.");
        }
        if (toolProductInstanceDTO.getSupplierId() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid supplierId.");
        }

        if (toolProductInstanceDTO.getPurchaseDate() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid purchaseDate.");
        }
        if (toolProductInstanceDTO.getPurchasePrice() == null || toolProductInstanceDTO.getPurchasePrice() < 0) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid purchasePrice.");
        }
        if (toolProductInstanceDTO.getVatRate() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a VatRate applied.");
        }
    }

    public void validateIndependentToolProductInstanceDTO(ToolProductInstanceDTO toolProductInstanceDTO) {
        if (toolProductInstanceDTO.getToolProductId() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid toolProductId.");
        }

    }
}
