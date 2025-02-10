package com.podocare.PodoCareWebsite.service.product_category.product_instances;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceUpdateException;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.order.OrderProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.repo.product_category.SaleProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.SaleProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import com.podocare.PodoCareWebsite.service.order.SupplierService;
import com.podocare.PodoCareWebsite.service.product_category.SaleProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Slf4j
@Service
public class SaleProductInstanceService {

    @Autowired
    private SaleProductInstanceRepo saleProductInstanceRepo;
    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private SupplierService supplierService;
    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    @Lazy
    private OrderService orderService;

    public SaleProductInstance getSaleProductInstanceById(Long saleProductInstanceId) {
        return saleProductInstanceRepo.findById(saleProductInstanceId)
                .orElseThrow(() -> new ProductInstanceNotFoundException("SaleProductInstance not found with id: " + saleProductInstanceId));
    }

    public List<SaleProductInstance> getSaleProductInstancesBySaleProductId(Long saleProductId){
        saleProductService.getSaleProductById(saleProductId);
        return saleProductInstanceRepo.findBySaleProductId(saleProductId);
    }

    public SaleProductInstance createInstance(SaleProductInstanceDTO saleProductInstanceDTO){
        validateSaleProductInstanceDTO(saleProductInstanceDTO);

        SaleProductInstance saleProductInstance = new SaleProductInstance();
        SaleProductInstance saleProductInstanceToSave = saleProductInstanceDtoToSaleProductInstanceConversion(saleProductInstance, saleProductInstanceDTO);

        try {
            saleProductInstanceRepo.save(saleProductInstanceToSave);
            incrementCurrentSupply(saleProductInstanceToSave.getSaleProduct());
        } catch (Exception e) {
            throw new ProductInstanceCreationException("Failed to create SaleProductInstance.", e);
        }

        return saleProductInstanceToSave;
    }

    public SaleProductInstance createIndependentInstance(SaleProductInstanceDTO saleProductInstanceDTO){
        validateIndependentSaleProductInstanceDTO(saleProductInstanceDTO);
        SaleProductInstance saleProductInstance = new SaleProductInstance();
        SaleProductInstance saleProductInstanceToSave =saleProductInstanceDtoToIndependentSaleProductInstanceConversion(saleProductInstance, saleProductInstanceDTO);
        try {
            saleProductInstanceRepo.save(saleProductInstanceToSave);
            incrementCurrentSupply(saleProductInstanceToSave.getSaleProduct());
        } catch(Exception e) {
            throw new ProductInstanceCreationException("Failed to create SaleProductInstance.", e);
        }

        return saleProductInstanceToSave;
    }

    @Transactional
    public SaleProductInstance updateInstance(Long saleProductInstanceId,
                                              SaleProductInstanceDTO saleProductInstanceDTO){
        SaleProductInstance existingSaleProductInstance =  getSaleProductInstanceById(saleProductInstanceId);
        validateSaleProductInstanceDTO(saleProductInstanceDTO);
        SaleProductInstance saleProductInstanceToUpdate = saleProductInstanceDtoToSaleProductInstanceConversion(existingSaleProductInstance, saleProductInstanceDTO);

        boolean wasActive = !existingSaleProductInstance.getIsSold() && !existingSaleProductInstance.getIsUsed();
        boolean isNowActive = !saleProductInstanceToUpdate.getIsSold() && !saleProductInstanceToUpdate.getIsUsed();
        SaleProduct saleProduct = saleProductInstanceToUpdate.getSaleProduct();

        try {
            saleProductInstanceRepo.save(saleProductInstanceToUpdate);
            if (wasActive && !isNowActive) {
                decrementCurrentSupply(saleProduct);
            } else if (!wasActive && isNowActive) {
                incrementCurrentSupply(saleProduct);
            }
        } catch (Exception e) {
            log.error("Failed to update SaleProductInstance or currentSupply for Product ID: {}", saleProduct.getId(), e);
            throw new ProductInstanceUpdateException("Error occurred while updating SaleProductInstance.", e);
        }

        return saleProductInstanceToUpdate;
    }

    @Transactional
    public void deleteInstance(Long saleProductInstanceId){
        SaleProductInstance existingSaleProductInstance =  getSaleProductInstanceById(saleProductInstanceId);

        boolean isActive = !existingSaleProductInstance.getIsSold() && !existingSaleProductInstance.getIsUsed() && !existingSaleProductInstance.getIsDeleted();

        existingSaleProductInstance.setIsDeleted(true);

        try{
            saleProductInstanceRepo.save(existingSaleProductInstance);
            if(isActive) {
                decrementCurrentSupply(existingSaleProductInstance.getSaleProduct());
            }
        } catch (Exception e) {
            log.error("Failed to soft delete SaleProductInstance ID: {}", saleProductInstanceId, e);
            throw new ProductInstanceDeletionException("Failed to soft delete SaleProductInstance.", e);
        }
    }

    @Transactional
    public void hardDeleteInstance(Long saleProductInstanceId) {
        SaleProductInstance existingSaleProductInstance =  getSaleProductInstanceById(saleProductInstanceId);

        boolean wasSoftDeleted = existingSaleProductInstance.getIsDeleted();
        boolean isActive = !existingSaleProductInstance.getIsSold() && !existingSaleProductInstance.getIsUsed() && !wasSoftDeleted;

        try {
            saleProductInstanceRepo.deleteById(saleProductInstanceId);
            if(isActive) {
                decrementCurrentSupply(existingSaleProductInstance.getSaleProduct());
            }
        } catch (Exception e) {
            log.error("Failed to hard delete SaleProductInstance ID: {}", saleProductInstanceId, e);
            throw new ProductInstanceDeletionException("Failed to hard delete SaleProductInstance.", e);
        }
    }

    @Transactional
    public void hardDeleteAllInstances(List<SaleProductInstance> saleProductInstances) {
        if(saleProductInstances == null || saleProductInstances.isEmpty()) {
            return;
        }

        long activeCount = saleProductInstances.stream()
                .filter(instance -> !instance.getIsUsed() && !instance.getIsSold() && !instance.getIsDeleted())
                .count();

        SaleProduct saleProduct = saleProductInstances.getFirst().getSaleProduct();

        try{
            saleProductInstanceRepo.deleteAll(saleProductInstances);
            if(activeCount > 0) {
                decrementCurrentSupplyByAmount(saleProduct, (int) activeCount);
            }
        } catch (Exception e) {
            throw new ProductInstanceDeletionException("Failed to batch hard delete SaleProductInstances.", e);
        }
    }

    @Transactional
    public void batchDeleteInstancesByProduct(SaleProduct saleProduct) {

        List<SaleProductInstance> saleProductInstances = saleProduct.getProductInstances();

        long activeCount = saleProductInstances.stream()
                .filter(instance -> !instance.getIsSold() && !instance.getIsUsed() && !instance.getIsDeleted())
                .count();

        List<Long> instanceIds = saleProductInstances.stream()
                .map(SaleProductInstance::getId)
                .toList();
        try {
            saleProductInstanceRepo.markInstancesAsDeletedByIds(instanceIds);
            if(activeCount > 0) {
                decrementCurrentSupplyByAmount(saleProduct, (int) activeCount);
            }
        } catch (Exception e) {
            throw new ProductInstanceDeletionException("Failed to batch soft delete SaleProductInstances.", e);
        }
    }

    public void calculateAndSetShelfLife(SaleProductInstance saleProductInstance,
                                   SaleProductInstanceDTO saleProductInstanceDTO){
        SaleProduct saleProduct = saleProductService.getSaleProductById(saleProductInstanceDTO.getSaleProductId());
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(saleProductInstanceDTO.getPurchaseDate());
        calendar.add(Calendar.MONTH, saleProduct.getEstimatedShelfLife());
        saleProductInstance.setShelfLife(calendar.getTime());
    }

    public SaleProductInstance saleProductInstanceDtoToSaleProductInstanceConversion(SaleProductInstance saleProductInstance,
                                                                                     SaleProductInstanceDTO saleProductInstanceDTO){
        saleProductInstance.setSaleProduct(saleProductService.getSaleProductById(saleProductInstanceDTO.getSaleProductId()));
        saleProductInstance.setSupplier(supplierService.findOrCreateSupplier(supplierService.getSupplierById(saleProductInstanceDTO.getSupplierId()).getSupplierName()));
        saleProductInstance.setOrder(orderService.findOrderByOrderNumber(saleProductInstanceDTO.getOrderNumber()));
        saleProductInstance.setPurchaseDate(saleProductInstanceDTO.getPurchaseDate());
        saleProductInstance.setPurchasePrice(saleProductInstanceDTO.getPurchasePrice());
        saleProductInstance.setVatRate(saleProductInstanceDTO.getVatRate());
        saleProductInstance.setNetPrice(saleProductInstanceDTO.getNetPrice());
        saleProductInstance.setDescription(saleProductInstanceDTO.getDescription());
        saleProductInstance.setIsSold(saleProductInstanceDTO.getIsSold() != null ? saleProductInstanceDTO.getIsSold() : false);
        saleProductInstance.setIsUsed(saleProductInstanceDTO.getIsUsed()!= null ? saleProductInstanceDTO.getIsUsed() : false);
        calculateAndSetShelfLife(saleProductInstance,saleProductInstanceDTO);
        return saleProductInstance;
    }

    public SaleProductInstance saleProductInstanceDtoToIndependentSaleProductInstanceConversion(SaleProductInstance saleProductInstance,
                                                                                                SaleProductInstanceDTO saleProductInstanceDTO){
        saleProductInstance.setSaleProduct(saleProductService.getSaleProductById(saleProductInstanceDTO.getSaleProductId()));
        saleProductInstance.setPurchasePrice(saleProductInstanceDTO.getPurchasePrice());
        saleProductInstance.setVatRate(saleProductInstanceDTO.getVatRate());
        saleProductInstance.setNetPrice(saleProductInstanceDTO.getNetPrice());
        saleProductInstance.setDescription(saleProductInstanceDTO.getDescription());
        if (saleProductInstanceDTO.getPurchaseDate() == null) {
            saleProductInstance.setPurchaseDate(new Date());
        } else {
            saleProductInstance.setPurchaseDate(saleProductInstanceDTO.getPurchaseDate());
        }
        calculateAndSetShelfLife(saleProductInstance,saleProductInstanceDTO);
        return saleProductInstance;
    }

    public Long countSaleProductInstancesAvailable(Long saleProductId) {
        SaleProduct existingProduct = saleProductService.getSaleProductById(saleProductId);
        return saleProductInstanceRepo.countAvailableInstances();
    }

    public void incrementCurrentSupply (SaleProduct saleProduct) {
        saleProduct.setCurrentSupply(saleProduct.getCurrentSupply() +1);
        try {
            saleProductRepo.save(saleProduct);
        } catch (Exception e) {
            throw new ProductUpdateException("Failed to save updated SaleProduct.", e);
        }
    }

    public void decrementCurrentSupply (SaleProduct saleProduct) {
        if(saleProduct.getCurrentSupply() > 0) {
            saleProduct.setCurrentSupply(saleProduct.getCurrentSupply() - 1);
            try {
                saleProductRepo.save(saleProduct);
            } catch (Exception e) {
                throw new ProductUpdateException("Failed to save updated SaleProduct.", e);
            }
        } else {
            throw new IllegalStateException("CurrentSupply cannot be negative");
        }
    }

    public void decrementCurrentSupplyByAmount(SaleProduct saleProduct, int amount){
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount to decrement must be greater than zero.");
        }
        if (saleProduct.getCurrentSupply() < amount) {
            throw new IllegalStateException("CurrentSupply cannot be negative.");
        }

        saleProduct.setCurrentSupply(saleProduct.getCurrentSupply() - amount);
        try {
            saleProductRepo.save(saleProduct);
        } catch (Exception e) {
            throw new ProductUpdateException("Failed to save updated SaleProduct.", e);
        }
    }


    private void isValid(SaleProductInstanceDTO saleProductInstanceDTO) {
        if (saleProductInstanceDTO.getPurchasePrice() < 0) {
            throw new ProductInstanceCreationException("PurchasePrice cannot be negative.");
        }
    }

    public void validateSaleProductInstanceDTO(SaleProductInstanceDTO saleProductInstanceDTO) {
        if (saleProductInstanceDTO.getSaleProductId() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid saleProductId.");
        }
        if (saleProductInstanceDTO.getSupplierId() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid supplierId.");
        }
        if (saleProductInstanceDTO.getOrderNumber() == null || saleProductInstanceDTO.getOrderNumber() <= 0) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid orderNumber.");
        }
        if (saleProductInstanceDTO.getPurchaseDate() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid purchaseDate.");
        }
        if (saleProductInstanceDTO.getPurchasePrice() == null || saleProductInstanceDTO.getPurchasePrice() < 0) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid purchasePrice.");
        }
        if (saleProductInstanceDTO.getVatRate() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a VatRate applied.");
        }
    }

    public void validateIndependentSaleProductInstanceDTO(SaleProductInstanceDTO saleProductInstanceDTO) {

        if (saleProductInstanceDTO.getSaleProductId() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid saleProductId.");
        }

    }
}
