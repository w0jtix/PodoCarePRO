package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.SaleProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;

import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.repo.product_category.SaleProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.SaleProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.order.BrandService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.SaleProductInstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SaleProductService{
    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private BrandService brandService;
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

    public SaleProduct getSaleProductWithActiveInstances(Long saleProductId) {
        SaleProduct saleProduct = getSaleProductById(saleProductId);

        if(saleProduct.getIsDeleted()) {

        }

        List<SaleProductInstance> activeInstances = saleProductInstanceRepo.findActiveInstancesByProductId(saleProductId);

        saleProduct.setProductInstances(activeInstances);
        return saleProduct;
    }

    public List<SaleProduct> getActiveSaleProductsWithActiveInstances() {
        return saleProductRepo.findAllActiveWithActiveInstances();
    }

    public SaleProduct getSaleProductById(Long saleProductId) {
        return saleProductRepo.findById(saleProductId)
                .orElseThrow(() -> new ProductNotFoundException("SaleProduct not found with ID: " + saleProductId));
    }

    public SaleProduct createSaleProduct(SaleProductDTO saleProductDTO) {
        isValid(saleProductDTO.getProductName());

        if(saleProductAlreadyExists(saleProductDTO)) {
            throw new ProductCreationException("Product already exists.");
        }
        SaleProduct saleProduct = new SaleProduct();
        SaleProduct saleProductToSave = saleProductDtoToSaleProductConversion(saleProduct, saleProductDTO);

        try {
            return saleProductRepo.save(saleProductToSave);
        } catch (Exception e) {
            throw new ProductCreationException("Failed to create the Product.", e);
        }
    }

    public SaleProduct updateSaleProduct(Long saleProductId, SaleProductDTO saleProductDTO) {
        SaleProduct existingProduct = getSaleProductById(saleProductId);

        isValid(saleProductDTO.getProductName());
        SaleProduct saleProductToUpdate = saleProductDtoToSaleProductConversion(existingProduct, saleProductDTO);

        try {
            return saleProductRepo.save(saleProductToUpdate);
        } catch (Exception e) {
            throw new ProductCreationException("Failed to update existing Product.", e);
        }
    }

    public void deleteSaleProduct(Long saleProductId) {
        SaleProduct existingProduct = getSaleProductById(saleProductId);

        saleProductInstanceService.batchDeleteInstancesByProduct(existingProduct);
        existingProduct.setIsDeleted(true);

        try{
            saleProductRepo.save(existingProduct);
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
        saleProduct.setInitialSupply(saleProductDTO.getInitialSupply());
        saleProduct.setCurrentSupply(saleProductDTO.getCurrentSupply());
        saleProduct.setDescription(saleProductDTO.getDescription());
        saleProduct.setEstimatedShelfLife(saleProductDTO.getEstimatedShelfLife());
        saleProduct.setSellingPrice(saleProductDTO.getSellingPrice());
        saleProduct.setInternalUse(saleProductDTO.getInternalUse());
        saleProduct.setForSale(saleProductDTO.getForSale());
        return saleProduct;
    }



    private boolean saleProductAlreadyExists(SaleProductDTO saleProductDTO) {
        return saleProductRepo.findBySaleProductName(saleProductDTO.getProductName()).isPresent();
    }

    private void isValid(String productName) {
        if(productName == null) {
            throw new ProductCreationException("ProductName cannot be null.");
        } else if (productName.length() < 2) {
            throw new ProductCreationException("ProductName requires 2+ characters.");
        }
    }


}


