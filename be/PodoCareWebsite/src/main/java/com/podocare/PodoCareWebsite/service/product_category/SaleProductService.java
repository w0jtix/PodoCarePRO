package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.SaleProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;

import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.repo.order.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.SaleProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.SaleProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.SaleProductInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SaleProductService{
    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private BrandService brandService;
    @Autowired
    private OrderProductRepo orderProductRepo;
    @Autowired
    private SaleProductInstanceRepo saleProductInstanceRepo;
    @Autowired
    @Lazy
    private SaleProductInstanceService saleProductInstanceService;



    public SaleProduct findBySaleProductName(String productName){
        return saleProductRepo.findBySaleProductName(productName)
                .orElseThrow(() -> new ProductNotFoundException("SaleProduct not found."));
    }

    public List<SaleProduct> getSaleProducts() {
        return saleProductRepo.findAll();
    }

    public List<SaleProduct> getActiveSaleProductsWithActiveInstances() {
        List<SaleProduct> products = saleProductRepo.findAllActiveSaleProducts();
        for (SaleProduct product : products) {
            product.setProductInstances(getActiveInstances(product.getId())
            );
        }
        return products;
    }

    public SaleProduct getSaleProductById(Long saleProductId) {
        return saleProductRepo.findById(saleProductId)
                .orElseThrow(() -> new ProductNotFoundException("SaleProduct not found with ID: " + saleProductId));
    }

    public SaleProduct getSaleProductByIdNullable(Long saleProductId) {
        return saleProductRepo.findById(saleProductId)
                .orElse(null);
    }

    public SaleProduct createSaleProduct(SaleProductDTO saleProductDTO) {
        isValid(saleProductDTO.getProductName());

        if(saleProductAlreadyExists(saleProductDTO.getProductName())) {
            throw new ProductCreationException("Product already exists.");
        }
        SaleProduct saleProduct = new SaleProduct();
        SaleProduct saleProductToSave = saleProductDtoToSaleProductConversion(saleProduct, saleProductDTO);

        try {
            SaleProduct savedProduct = saleProductRepo.save(saleProductToSave);
            Long saleProductId = savedProduct.getId();

            if(saleProductDTO.getProductInstances() != null && !saleProductDTO.getProductInstances().isEmpty()) {
                for(SaleProductInstanceDTO instanceDTO : saleProductDTO.getProductInstances()) {
                    instanceDTO.setProductId(saleProductId);
                    saleProductInstanceService.createInstance(instanceDTO);
                }
            }
            return savedProduct;
        } catch (Exception e) {
            throw new ProductCreationException("Failed to create the Product. Reason: " + e.getMessage(), e);
        }
    }

    public SaleProduct updateSaleProduct(Long saleProductId, SaleProductDTO saleProductDTO) {
        try {
            SaleProduct existingProduct = getSaleProductById(saleProductId);
            boolean updated = false;

            if(saleProductDTO.getProductName() != null) {
                isValid(saleProductDTO.getProductName());
                existingProduct.setProductName(saleProductDTO.getProductName());
                updated = true;
            }
            if (saleProductDTO.getBrandName() != null) {
                existingProduct.setBrand(brandService.findOrCreateBrand(saleProductDTO.getBrandName()));
                updated = true;
            }
            if(saleProductDTO.getDescription() != null) {
                existingProduct.setDescription(saleProductDTO.getDescription());
                updated = true;
            }
            if(saleProductDTO.getEstimatedShelfLife() != null) {
                existingProduct.setEstimatedShelfLife(saleProductDTO.getEstimatedShelfLife());
                updated = true;
            }
            if(saleProductDTO.getSellingPrice() != null) {
                existingProduct.setSellingPrice(saleProductDTO.getSellingPrice());
                updated = true;
            }
            if(saleProductDTO.getIsDeleted() != null) {
                existingProduct.setIsDeleted(saleProductDTO.getIsDeleted());
                updated = true;
            }

            if (updated) {
                return saleProductRepo.save(existingProduct);
            }
            return existingProduct;
        } catch (Exception e) {
            throw new ProductCreationException("Failed to update existing Product.", e);
        }
    }

    public void deleteSaleProduct(Long saleProductId) {
        try{
            saleProductRepo.deleteById(saleProductId);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public void softDeleteSaleProduct(Long saleProductId) {
        try{
            SaleProduct existingProduct = getSaleProductById(saleProductId);
            existingProduct.setIsDeleted(true);
            saleProductRepo.save(existingProduct);
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public void deleteSaleProductAndActiveInstances(Long saleProductId) {
        SaleProduct existingProduct = getSaleProductById(saleProductId);
        boolean hasOrderProductReference = orderProductRepo.hasSaleProductReference(saleProductId);

        List<SaleProductInstance> inactiveInstances = existingProduct.getProductInstances().stream()
                        .filter(instance -> instance.getIsUsed() || instance.getIsSold())
                                .toList();

        saleProductInstanceService.hardDeleteAllActiveInstances(existingProduct.getProductInstances());

        try{
            if (inactiveInstances.isEmpty() && !hasOrderProductReference) {
                saleProductRepo.deleteById(saleProductId);
            } else {
                existingProduct.setIsDeleted(true);
                saleProductRepo.save(existingProduct);
            }
        } catch (Exception e){
            throw new ProductDeletionException("Failed to delete existing Product.", e);
        }
    }

    public List<SaleProduct> searchSaleProducts(String keyword) {
        return saleProductRepo.searchProducts(keyword);
    }

    public SaleProduct saleProductDtoToSaleProductConversion(SaleProduct saleProduct, SaleProductDTO saleProductDTO){
        saleProduct.setProductName(saleProductDTO.getProductName());
        saleProduct.setBrand(brandService.findOrCreateBrand(saleProductDTO.getBrandName()));
        saleProduct.setInitialSupply(saleProductDTO.getInitialSupply() != null ? saleProductDTO.getInitialSupply()  : 0);
        saleProduct.setCurrentSupply(saleProductDTO.getCurrentSupply() != null ? saleProductDTO.getCurrentSupply() : 0);
        saleProduct.setDescription(saleProductDTO.getDescription());
        saleProduct.setEstimatedShelfLife(saleProductDTO.getEstimatedShelfLife() != null ? saleProductDTO.getEstimatedShelfLife() : 24);
        saleProduct.setSellingPrice(saleProductDTO.getSellingPrice());
        saleProduct.setInternalUse(saleProductDTO.getInternalUse());
        saleProduct.setForSale(saleProductDTO.getForSale());
        return saleProduct;
    }

    public SaleProductDTO saleProductToSaleProductDTOConversion(SaleProduct saleProduct, SaleProductDTO saleProductDTO) {
        saleProductDTO.setId(saleProduct.getId());
        saleProductDTO.setProductName(saleProduct.getProductName());
        saleProductDTO.setBrandName(saleProduct.getBrand().getBrandName());
        saleProductDTO.setInitialSupply(saleProduct.getInitialSupply());
        saleProductDTO.setCurrentSupply(saleProduct.getCurrentSupply());
        saleProductDTO.setDescription(saleProduct.getDescription());
        saleProductDTO.setEstimatedShelfLife(saleProduct.getEstimatedShelfLife());
        saleProductDTO.setSellingPrice(saleProduct.getSellingPrice());
        saleProductDTO.setInternalUse(saleProduct.getInternalUse());
        saleProductDTO.setForSale(saleProduct.getForSale());
        saleProductDTO.setCategory(saleProduct.getCategory());
        List<SaleProductInstanceDTO> instanceDTOList = new ArrayList<>();
        for(SaleProductInstance saleProductInstance : saleProduct.getProductInstances()) {
            SaleProductInstanceDTO saleProductInstanceDTO = new SaleProductInstanceDTO();
            instanceDTOList.add(
                    saleProductInstanceService.saleProductInstanceToSaleProductInstanceDTO(saleProductInstance,saleProductInstanceDTO)
            );
        }
        saleProductDTO.setProductInstances(instanceDTOList);
        return saleProductDTO;
    }

    public SaleProductDTO getSaleProductDTOIncludeActiveInstances(Long productId){
        SaleProduct product = getSaleProductById(productId);
        SaleProductDTO saleProductDTO = saleProductToSaleProductDTOConversion(product, new SaleProductDTO());
        List<SaleProductInstanceDTO> activeInstanceDTOList = new ArrayList<>();
        for(SaleProductInstance saleProductInstance : getActiveInstances(productId)) {
            SaleProductInstanceDTO saleProductInstanceDTO = new SaleProductInstanceDTO();
            activeInstanceDTOList.add(
                    saleProductInstanceService.saleProductInstanceToSaleProductInstanceDTO(saleProductInstance,saleProductInstanceDTO)
            );
        }
        saleProductDTO.setActiveProductInstances(activeInstanceDTOList);
        return saleProductDTO;
    }

    public List<SaleProductInstance> getActiveInstances(Long saleProductId) {
        SaleProduct saleProduct = getSaleProductById(saleProductId);
        List<SaleProductInstance> allInstances =  saleProduct.getProductInstances();

        return allInstances.stream().filter(SaleProductInstance::getIsAvailable).toList();
    }

    public boolean saleProductAlreadyExists(String saleProductName) {
        return saleProductRepo.findBySaleProductName(saleProductName).isPresent();
    }

    public List<SaleProductInstance> getAllInstances(Long saleProductId) {
        SaleProduct saleProduct = getSaleProductById(saleProductId);
        return saleProduct.getProductInstances();
    }

    private void isValid(String productName) {
        if(productName == null) {
            throw new ProductCreationException("ProductName cannot be null.");
        } else if (productName.length() < 2) {
            throw new ProductCreationException("ProductName requires 2+ characters.");
        }
    }


}



