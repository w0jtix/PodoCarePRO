package com.podocare.PodoCareWebsite.service.product_category.product_instances;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.repo.product_category.EquipmentProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.EquipmentProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import com.podocare.PodoCareWebsite.service.order.SupplierService;
import com.podocare.PodoCareWebsite.service.product_category.EquipmentProductService;
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
public class EquipmentProductInstanceService {

    @Autowired
    private EquipmentProductInstanceRepo equipmentProductInstanceRepo;
    @Autowired
    private EquipmentProductRepo equipmentProductRepo;
    @Autowired
    private SupplierService supplierService;
    @Autowired
    private EquipmentProductService equipmentProductService;
    @Autowired
    @Lazy
    private OrderService orderService;

    public EquipmentProductInstance getEquipmentProductInstanceById(Long equipmentProductInstanceId) {
        return equipmentProductInstanceRepo.findById(equipmentProductInstanceId)
                .orElseThrow(() -> new ProductInstanceNotFoundException("EquipmentProductInstance not found with id: " + equipmentProductInstanceId));
    }

    public List<EquipmentProductInstance> getEquipmentProductInstancesByEquipmentProductId(Long equipmentProductId){
        equipmentProductService.getEquipmentProductById(equipmentProductId);
        return equipmentProductInstanceRepo.findByEquipmentProductId(equipmentProductId);
    }

    public EquipmentProductInstance createInstance(EquipmentProductInstanceDTO equipmentProductInstanceDTO){
        validateEquipmentProductInstanceDTO(equipmentProductInstanceDTO);

        EquipmentProductInstance equipmentProductInstance = new EquipmentProductInstance();
        EquipmentProductInstance equipmentProductInstanceToSave = equipmentProductInstanceDtoToEquipmentProductInstanceConversion(equipmentProductInstance, equipmentProductInstanceDTO);

        try {
            equipmentProductInstanceRepo.save(equipmentProductInstanceToSave);
            incrementCurrentSupply(equipmentProductInstanceToSave.getEquipmentProduct());
        } catch (Exception e) {
            throw new ProductInstanceCreationException("Failed to create EquipmentProductInstance.", e);
        }

        return equipmentProductInstanceToSave;
    }

    public EquipmentProductInstance createIndependentInstance(EquipmentProductInstanceDTO equipmentProductInstanceDTO){
        validateIndependentEquipmentProductInstanceDTO(equipmentProductInstanceDTO);
        EquipmentProductInstance equipmentProductInstance = new EquipmentProductInstance();
        EquipmentProductInstance equipmentProductInstanceToSave =equipmentProductInstanceDtoToIndependentEquipmentProductInstanceConversion(equipmentProductInstance, equipmentProductInstanceDTO);
        try {
            equipmentProductInstanceRepo.save(equipmentProductInstanceToSave);
            incrementCurrentSupply(equipmentProductInstanceToSave.getEquipmentProduct());
        } catch(Exception e) {
            throw new ProductInstanceCreationException("Failed to create EquipmentProductInstance.", e);
        }

        return equipmentProductInstanceToSave;
    }

    public EquipmentProductInstance updateInstance(Long equipmentProductInstanceId,
                                              EquipmentProductInstanceDTO equipmentProductInstanceDTO){
        EquipmentProductInstance existingEquipmentProductInstance =  getEquipmentProductInstanceById(equipmentProductInstanceId);
        boolean wasActive = !existingEquipmentProductInstance.getOutOfUse();
        validateIndependentEquipmentProductInstanceDTO(equipmentProductInstanceDTO);

        if(equipmentProductInstanceDTO.getPurchaseDate() != null) {
            existingEquipmentProductInstance.setPurchaseDate(equipmentProductInstanceDTO.getPurchaseDate());
        }
        if(equipmentProductInstanceDTO.getWarrantyEndDate() != null) {
            existingEquipmentProductInstance.setWarrantyEndDate(equipmentProductInstanceDTO.getWarrantyEndDate());
        }
        if(equipmentProductInstanceDTO.getDescription() != null) {
            existingEquipmentProductInstance.setDescription(equipmentProductInstanceDTO.getDescription());
        }
        if(equipmentProductInstanceDTO.getOutOfUse() != null) {
            existingEquipmentProductInstance.setOutOfUse(equipmentProductInstanceDTO.getOutOfUse());
        }

        EquipmentProduct equipmentProduct = equipmentProductService.getEquipmentProductById(existingEquipmentProductInstance.getEquipmentProduct().getId());

        try {
            equipmentProductInstanceRepo.save(existingEquipmentProductInstance);
            boolean isNowActive = !existingEquipmentProductInstance.getOutOfUse();
            if (wasActive && !isNowActive) {
                decrementCurrentSupply(equipmentProduct);
            } else if (!wasActive && isNowActive) {
                incrementCurrentSupply(equipmentProduct);
            }
        } catch (Exception e) {
            log.error("Failed to update EquipmentProductInstance or currentSupply for Product ID: {}", equipmentProduct.getId(), e);
            throw new ProductInstanceUpdateException("Error occurred while updating EquipmentProductInstance.", e);
        }

        return existingEquipmentProductInstance;
    }


    public void deleteInstance(Long equipmentProductInstanceId) {
        EquipmentProductInstance existingEquipmentProductInstance =  getEquipmentProductInstanceById(equipmentProductInstanceId);

        boolean isActive = !existingEquipmentProductInstance.getOutOfUse();

        try {
            equipmentProductInstanceRepo.deleteById(equipmentProductInstanceId);
            if(isActive) {
                decrementCurrentSupply(existingEquipmentProductInstance.getEquipmentProduct());
            }
        } catch (Exception e) {
            log.error("Failed to hard delete EquipmentProductInstance ID: {}", equipmentProductInstanceId, e);
            throw new ProductInstanceDeletionException("Failed to hard delete EquipmentProductInstance.", e);
        }
    }

    public List<EquipmentProductInstance> getClosestDateSortedActiveInstanceList(Long equipmentProductId, Date date) {
        List<EquipmentProductInstance> activeInstances = equipmentProductService.getActiveInstances(equipmentProductId);

        return activeInstances.stream()
                .sorted((instance1, instance2) -> {
                    long diff1 = Math.abs(instance1.getPurchaseDate().getTime() - date.getTime());
                    long diff2 = Math.abs(instance2.getPurchaseDate().getTime() - date.getTime());
                    return Long.compare(diff1, diff2);
                })
                .toList();
    }

    @Transactional
    public void hardDeleteAllInstances(List<EquipmentProductInstance> equipmentProductInstances) {
        if(equipmentProductInstances == null || equipmentProductInstances.isEmpty()){
            return;
        }

        long activeCount = equipmentProductInstances.stream()
                .filter(instance -> !instance.getOutOfUse())
                .count();
        EquipmentProduct equipmentProduct = equipmentProductInstances.getFirst().getEquipmentProduct();


        try{
            equipmentProductInstanceRepo.deleteAll(equipmentProductInstances);
            if(activeCount > 0) {
                decrementCurrentSupplyByAmount(equipmentProduct, (int) activeCount);
            }
        } catch (Exception e) {
            throw new ProductInstanceDeletionException("Failed to batch hard delete EquipmentProductInstances.", e);
        }
    }

    public void calculateAndSetWarrantyEndDate(EquipmentProductInstance equipmentProductInstance,
                                         EquipmentProductInstanceDTO equipmentProductInstanceDTO){
        EquipmentProduct equipmentProduct = equipmentProductService.getEquipmentProductById(equipmentProductInstanceDTO.getProductId());
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(equipmentProductInstanceDTO.getPurchaseDate());
        calendar.add(Calendar.MONTH, equipmentProduct.getWarrantyLength());
        equipmentProductInstance.setWarrantyEndDate(calendar.getTime());
    }

    public EquipmentProductInstance equipmentProductInstanceDtoToEquipmentProductInstanceConversion(EquipmentProductInstance equipmentProductInstance,
                                                                                     EquipmentProductInstanceDTO equipmentProductInstanceDTO){
        equipmentProductInstance.setEquipmentProduct(equipmentProductService.getEquipmentProductById(equipmentProductInstanceDTO.getProductId()));
        equipmentProductInstance.setPurchaseDate(equipmentProductInstanceDTO.getPurchaseDate());
        equipmentProductInstance.setDescription(equipmentProductInstanceDTO.getDescription());
        equipmentProductInstance.setOutOfUse(equipmentProductInstanceDTO.getOutOfUse() != null ? equipmentProductInstanceDTO.getOutOfUse() : false);
        calculateAndSetWarrantyEndDate(equipmentProductInstance,equipmentProductInstanceDTO);
        return equipmentProductInstance;
    }

    public EquipmentProductInstance equipmentProductInstanceDtoToIndependentEquipmentProductInstanceConversion(EquipmentProductInstance equipmentProductInstance,
                                                                                                EquipmentProductInstanceDTO equipmentProductInstanceDTO){
        equipmentProductInstance.setEquipmentProduct(equipmentProductService.getEquipmentProductById(equipmentProductInstanceDTO.getProductId()));
        equipmentProductInstance.setDescription(equipmentProductInstanceDTO.getDescription());
        if (equipmentProductInstanceDTO.getPurchaseDate() == null) {
            equipmentProductInstance.setPurchaseDate(new Date());
        } else {
            equipmentProductInstance.setPurchaseDate(equipmentProductInstanceDTO.getPurchaseDate());
        }
        calculateAndSetWarrantyEndDate(equipmentProductInstance,equipmentProductInstanceDTO);
        return equipmentProductInstance;
    }

    public Long countEquipmentProductInstancesAvailable(Long equipmentProductId) {
        EquipmentProduct existingProduct = equipmentProductService.getEquipmentProductById(equipmentProductId);
        return equipmentProductInstanceRepo.countAvailableInstances();
    }

    public void incrementCurrentSupply (EquipmentProduct equipmentProduct) {
        equipmentProduct.setCurrentSupply(equipmentProduct.getCurrentSupply() +1);
        try {
            equipmentProductRepo.save(equipmentProduct);
        } catch (Exception e) {
            throw new ProductUpdateException("Failed to save updated EquipmentProduct.", e);
        }
    }

    public void decrementCurrentSupply (EquipmentProduct equipmentProduct) {
        if(equipmentProduct.getCurrentSupply() > 0) {
            equipmentProduct.setCurrentSupply(equipmentProduct.getCurrentSupply() - 1);
            try {
                equipmentProductRepo.save(equipmentProduct);
            } catch (Exception e) {
                throw new ProductUpdateException("Failed to save updated EquipmentProduct.", e);
            }
        } else {
            throw new IllegalStateException("CurrentSupply cannot be negative");
        }
    }

    public void decrementCurrentSupplyByAmount(EquipmentProduct equipmentProduct, int amount){
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount to decrement must be greater than zero.");
        }
        if (equipmentProduct.getCurrentSupply() < amount) {
            throw new IllegalStateException("CurrentSupply cannot be negative.");
        }

        equipmentProduct.setCurrentSupply(equipmentProduct.getCurrentSupply() - amount);
        try {
            equipmentProductRepo.save(equipmentProduct);
        } catch (Exception e) {
            throw new ProductUpdateException("Failed to save updated EquipmentProduct.", e);
        }
    }

    public void validateEquipmentProductInstanceDTO(EquipmentProductInstanceDTO equipmentProductInstanceDTO) {
        if (equipmentProductInstanceDTO.getProductId() == null) {
            throw new IllegalArgumentException("EquipmentProductInstanceDTO must have a valid equipmentProductName.");
        }
        if (equipmentProductInstanceDTO.getPurchaseDate() == null) {
            throw new IllegalArgumentException("EquipmentProductInstanceDTO must have a valid purchaseDate.");
        }
    }

    public void validateIndependentEquipmentProductInstanceDTO(EquipmentProductInstanceDTO equipmentProductInstanceDTO) {

        if (equipmentProductInstanceDTO.getProductId() == null) {
            throw new IllegalArgumentException("EquipmentProductInstanceDTO must have a valid equipmentProductId.");
        }

    }
}

