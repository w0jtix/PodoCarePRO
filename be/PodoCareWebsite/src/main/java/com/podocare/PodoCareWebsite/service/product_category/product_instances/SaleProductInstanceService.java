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
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
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
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

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

    public SaleProductInstance updateInstance(Long saleProductInstanceId,
                                              SaleProductInstanceDTO saleProductInstanceDTO){
        SaleProductInstance existingSaleProductInstance =  getSaleProductInstanceById(saleProductInstanceId);
        boolean wasActive = !existingSaleProductInstance.getIsSold() && !existingSaleProductInstance.getIsUsed();
        validateIndependentSaleProductInstanceDTO(saleProductInstanceDTO);

        if(saleProductInstanceDTO.getPurchaseDate() != null) {
            existingSaleProductInstance.setPurchaseDate(saleProductInstanceDTO.getPurchaseDate());
        }
        if(saleProductInstanceDTO.getSellingPrice() != null) {
            existingSaleProductInstance.setSellingPrice(saleProductInstanceDTO.getSellingPrice());
        }
        if(saleProductInstanceDTO.getShelfLife() != null) {
            existingSaleProductInstance.setShelfLife(saleProductInstanceDTO.getShelfLife());
        }
        if(saleProductInstanceDTO.getDescription() != null) {
            existingSaleProductInstance.setDescription(saleProductInstanceDTO.getDescription());
        }
        if(saleProductInstanceDTO.getIsSold() != null) {
            existingSaleProductInstance.setIsSold(saleProductInstanceDTO.getIsSold());
        }
        if(saleProductInstanceDTO.getIsUsed() != null) {
            existingSaleProductInstance.setIsUsed(saleProductInstanceDTO.getIsUsed());
        }

        SaleProduct saleProduct = saleProductService.getSaleProductById(existingSaleProductInstance.getSaleProduct().getId());

        try {
            saleProductInstanceRepo.save(existingSaleProductInstance);
            boolean isNowActive = !existingSaleProductInstance.getIsSold() && !existingSaleProductInstance.getIsUsed();
            if (wasActive && !isNowActive) {
                decrementCurrentSupply(saleProduct);
            } else if (!wasActive && isNowActive) {
                incrementCurrentSupply(saleProduct);
            }
        } catch (Exception e) {
            log.error("Failed to update SaleProductInstance or currentSupply for Product ID: {}", saleProduct.getId(), e);
            throw new ProductInstanceUpdateException("Error occurred while updating SaleProductInstance.", e);
        }
        return existingSaleProductInstance;
    }

    public void deleteInstance(Long saleProductInstanceId) {
        SaleProductInstance existingSaleProductInstance =  getSaleProductInstanceById(saleProductInstanceId);

        boolean isActive = !existingSaleProductInstance.getIsSold() && !existingSaleProductInstance.getIsUsed();

        try {
            if(isActive) {
                saleProductInstanceRepo.deleteById(saleProductInstanceId);
                decrementCurrentSupply(existingSaleProductInstance.getSaleProduct());
            }
        } catch (Exception e) {
            log.error("Failed to hard delete SaleProductInstance ID: {}", saleProductInstanceId, e);
            throw new ProductInstanceDeletionException("Failed to hard delete SaleProductInstance.", e);
        }
    }

    public void hardDeleteAllActiveInstances(List<SaleProductInstance> saleProductInstances) {
        if(saleProductInstances == null || saleProductInstances.isEmpty()) {
            return;
        }
        List<Long> instanceIds = saleProductInstances.stream()
                .map(SaleProductInstance::getId)
                .toList();
        for(Long instanceId : instanceIds) {
            deleteInstance(instanceId);
        }
    }

    public List<SaleProductInstance> getClosestDateSortedActiveInstanceList(Long saleProductId, Date date) {
        List<SaleProductInstance> activeInstances = saleProductService.getActiveInstances(saleProductId);

        return activeInstances.stream()
                .sorted((instance1, instance2) -> {
                    long diff1 = Math.abs(instance1.getPurchaseDate().getTime() - date.getTime());
                    long diff2 = Math.abs(instance2.getPurchaseDate().getTime() - date.getTime());
                    return Long.compare(diff1, diff2);
                })
                .toList();
    }

    public List<SaleProductInstance> getClosestDateSortedAllInstanceList(Long saleProductId, Date date) {
        List<SaleProductInstance> allInstances = saleProductService.getAllInstances(saleProductId);

        return allInstances.stream()
                .sorted((instance1, instance2) -> {
                    long diff1 = Math.abs(instance1.getPurchaseDate().getTime() - date.getTime());
                    long diff2 = Math.abs(instance2.getPurchaseDate().getTime() - date.getTime());
                    return Long.compare(diff1, diff2);
                })
                .toList();
    }

    public void calculateAndSetShelfLife(SaleProductInstance saleProductInstance,
                                   SaleProductInstanceDTO saleProductInstanceDTO){
        SaleProduct saleProduct = saleProductService.getSaleProductById(saleProductInstanceDTO.getProductId());
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(saleProductInstanceDTO.getPurchaseDate());
        calendar.add(Calendar.MONTH, saleProduct.getEstimatedShelfLife());
        saleProductInstance.setShelfLife(calendar.getTime());
    }

    public SaleProductInstance saleProductInstanceDtoToSaleProductInstanceConversion(SaleProductInstance saleProductInstance,
                                                                                     SaleProductInstanceDTO saleProductInstanceDTO){
        saleProductInstance.setSaleProduct(saleProductService.getSaleProductById(saleProductInstanceDTO.getProductId()));
        saleProductInstance.setPurchaseDate(saleProductInstanceDTO.getPurchaseDate());
        saleProductInstance.setSellingPrice(saleProductInstanceDTO.getSellingPrice());
        saleProductInstance.setDescription(saleProductInstanceDTO.getDescription());
        saleProductInstance.setIsSold(saleProductInstanceDTO.getIsSold() != null ? saleProductInstanceDTO.getIsSold() : false);
        saleProductInstance.setIsUsed(saleProductInstanceDTO.getIsUsed()!= null ? saleProductInstanceDTO.getIsUsed() : false);
        calculateAndSetShelfLife(saleProductInstance,saleProductInstanceDTO);
        return saleProductInstance;
    }

    public SaleProductInstance saleProductInstanceDtoToIndependentSaleProductInstanceConversion(SaleProductInstance saleProductInstance,
                                                                                                SaleProductInstanceDTO saleProductInstanceDTO){
        saleProductInstance.setSaleProduct(saleProductService.getSaleProductById(saleProductInstanceDTO.getProductId()));
        saleProductInstance.setDescription(saleProductInstanceDTO.getDescription());
        if (saleProductInstanceDTO.getPurchaseDate() == null) {
            saleProductInstance.setPurchaseDate(new Date());
        } else {
            saleProductInstance.setPurchaseDate(saleProductInstanceDTO.getPurchaseDate());
        }
        calculateAndSetShelfLife(saleProductInstance,saleProductInstanceDTO);
        return saleProductInstance;
    }

    public SaleProductInstanceDTO saleProductInstanceToSaleProductInstanceDTO(SaleProductInstance saleProductInstance, SaleProductInstanceDTO saleProductInstanceDTO) {
        saleProductInstanceDTO.setId(saleProductInstance.getId());
        saleProductInstanceDTO.setProductId(saleProductInstance.getSaleProduct().getId());
        saleProductInstanceDTO.setPurchaseDate(saleProductInstance.getPurchaseDate());
        saleProductInstanceDTO.setSellingPrice(saleProductInstance.getSellingPrice());
        saleProductInstanceDTO.setShelfLife(saleProductInstance.getShelfLife());
        saleProductInstanceDTO.setDescription(saleProductInstance.getDescription());
        saleProductInstanceDTO.setIsSold(saleProductInstance.getIsSold());
        saleProductInstanceDTO.setIsUsed(saleProductInstance.getIsUsed());
        return saleProductInstanceDTO;
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


    public void validateSaleProductInstanceDTO(SaleProductInstanceDTO saleProductInstanceDTO) {
        if (saleProductInstanceDTO.getProductId() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid saleProductId.");
        }

        if (saleProductInstanceDTO.getPurchaseDate() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid purchaseDate.");
        }
    }

    public void validateIndependentSaleProductInstanceDTO(SaleProductInstanceDTO saleProductInstanceDTO) {

        if (saleProductInstanceDTO.getProductId() == null) {
            throw new IllegalArgumentException("SaleProductInstanceDTO must have a valid saleProductId.");
        }

    }
}
