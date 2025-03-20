package com.podocare.PodoCareWebsite.service.product_category.product_instances;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.ToolProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import com.podocare.PodoCareWebsite.service.order.SupplierService;
import com.podocare.PodoCareWebsite.service.product_category.ToolProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public ToolProductInstance updateInstance(Long toolProductInstanceId,
                                              ToolProductInstanceDTO toolProductInstanceDTO){
        ToolProductInstance existingToolProductInstance =  getToolProductInstanceById(toolProductInstanceId);
        boolean wasActive = !existingToolProductInstance.getOutOfUse();
        validateIndependentToolProductInstanceDTO(toolProductInstanceDTO);

        if(toolProductInstanceDTO.getPurchaseDate() != null) {
            existingToolProductInstance.setPurchaseDate(toolProductInstanceDTO.getPurchaseDate());
        }
        if(toolProductInstanceDTO.getDescription() != null) {
            existingToolProductInstance.setDescription(toolProductInstanceDTO.getDescription());
        }
        if(toolProductInstanceDTO.getOutOfUse() != null) {
            existingToolProductInstance.setOutOfUse(toolProductInstanceDTO.getOutOfUse());
        }

        ToolProduct toolProduct = toolProductService.getToolProductById(existingToolProductInstance.getToolProduct().getId());

        try {
            toolProductInstanceRepo.save(existingToolProductInstance);
            boolean isNowActive = !existingToolProductInstance.getOutOfUse();
            if (wasActive && !isNowActive) {
                decrementCurrentSupply(toolProduct);
            } else if (!wasActive && isNowActive) {
                incrementCurrentSupply(toolProduct);
            }
        } catch (Exception e) {
            log.error("Failed to update ToolProductInstance or currentSupply for Product ID: {}", toolProduct.getId(), e);
            throw new ProductInstanceUpdateException("Error occurred while updating ToolProductInstance.", e);
        }

        return existingToolProductInstance;
    }

    public List<ToolProductInstance> getClosestDateSortedActiveInstanceList(Long toolProductId, Date date) {
        List<ToolProductInstance> activeInstances = toolProductService.getActiveInstances(toolProductId);

        return activeInstances.stream()
                .sorted((instance1, instance2) -> {
                    long diff1 = Math.abs(instance1.getPurchaseDate().getTime() - date.getTime());
                    long diff2 = Math.abs(instance2.getPurchaseDate().getTime() - date.getTime());
                    return Long.compare(diff1, diff2);
                })
                .toList();
    }

    public List<ToolProductInstance> getClosestDateSortedAllInstanceList(Long toolProductId, Date date) {
        List<ToolProductInstance> allInstances = toolProductService.getAllInstances(toolProductId);

        return allInstances.stream()
                .sorted((instance1, instance2) -> {
                    long diff1 = Math.abs(instance1.getPurchaseDate().getTime() - date.getTime());
                    long diff2 = Math.abs(instance2.getPurchaseDate().getTime() - date.getTime());
                    return Long.compare(diff1, diff2);
                })
                .toList();
    }


    public void deleteInstance(Long toolProductInstanceId) {
        ToolProductInstance existingToolProductInstance =  getToolProductInstanceById(toolProductInstanceId);

        boolean isActive = !existingToolProductInstance.getOutOfUse();

        try {
            if(isActive) {
                toolProductInstanceRepo.deleteById(toolProductInstanceId);
                decrementCurrentSupply(existingToolProductInstance.getToolProduct());
            }
        } catch (Exception e) {
            log.error("Failed to hard delete ToolProductInstance ID: {}", toolProductInstanceId, e);
            throw new ProductInstanceDeletionException("Failed to hard delete ToolProductInstance.", e);
        }
    }

    public void hardDeleteAllActiveInstances(List<ToolProductInstance> toolProductInstances) {
        if(toolProductInstances == null || toolProductInstances.isEmpty()) {
            return;
        }
        List<Long> instanceIds = toolProductInstances.stream()
                .map(ToolProductInstance::getId)
                .toList();
        for(Long instanceId : instanceIds) {
            deleteInstance(instanceId);
        }
    }

    public ToolProductInstance toolProductInstanceDtoToToolProductInstanceConversion(ToolProductInstance toolProductInstance,
                                                                                     ToolProductInstanceDTO toolProductInstanceDTO){
        toolProductInstance.setToolProduct(toolProductService.getToolProductById(toolProductInstanceDTO.getProductId()));
        toolProductInstance.setPurchaseDate(toolProductInstanceDTO.getPurchaseDate());
        toolProductInstance.setDescription(toolProductInstanceDTO.getDescription());
        toolProductInstance.setOutOfUse(toolProductInstanceDTO.getOutOfUse() != null ? toolProductInstanceDTO.getOutOfUse() : false);
        return toolProductInstance;
    }

    public ToolProductInstance toolProductInstanceDtoToIndependentToolProductInstanceConversion(ToolProductInstance toolProductInstance,
                                                                                                ToolProductInstanceDTO toolProductInstanceDTO){
        toolProductInstance.setToolProduct(toolProductService.getToolProductById(toolProductInstanceDTO.getProductId()));
        toolProductInstance.setDescription(toolProductInstanceDTO.getDescription());
        if (toolProductInstanceDTO.getPurchaseDate() == null) {
            toolProductInstance.setPurchaseDate(new Date());
        } else {
            toolProductInstance.setPurchaseDate(toolProductInstanceDTO.getPurchaseDate());
        }
        return toolProductInstance;
    }

    public ToolProductInstanceDTO toolProductInstanceToToolProductInstanceDTO(ToolProductInstance toolProductInstance, ToolProductInstanceDTO toolProductInstanceDTO) {
        toolProductInstanceDTO.setId(toolProductInstance.getId());
        toolProductInstanceDTO.setProductId(toolProductInstance.getToolProduct().getId());
        toolProductInstanceDTO.setPurchaseDate(toolProductInstance.getPurchaseDate());
        toolProductInstanceDTO.setDescription(toolProductInstance.getDescription());
        toolProductInstanceDTO.setOutOfUse(toolProductInstance.getOutOfUse());
        return toolProductInstanceDTO;
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

    public void validateToolProductInstanceDTO(ToolProductInstanceDTO toolProductInstanceDTO) {
        if (toolProductInstanceDTO.getProductId() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid toolProductName.");
        }
        if (toolProductInstanceDTO.getPurchaseDate() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid purchaseDate.");
        }
    }

    public void validateIndependentToolProductInstanceDTO(ToolProductInstanceDTO toolProductInstanceDTO) {
        if (toolProductInstanceDTO.getProductId() == null) {
            throw new IllegalArgumentException("ToolProductInstanceDTO must have a valid toolProductId.");
        }

    }
}
