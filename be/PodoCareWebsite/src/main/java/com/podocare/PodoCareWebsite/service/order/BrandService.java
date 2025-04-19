package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand.*;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.BrandDTO;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.BrandFilterDTO;
import com.podocare.PodoCareWebsite.repo.order.BrandRepo;
import com.podocare.PodoCareWebsite.repo.product_category.EquipmentProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.SaleProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class BrandService {
    @Autowired
    private BrandRepo brandRepo;
    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private ToolProductRepo toolProductRepo;
    @Autowired
    private EquipmentProductRepo equipmentProductRepo;


    public BrandDTO getBrandDTOById(Long brandId){
        Brand brand = brandRepo.findById(brandId)
                .orElseThrow(() -> new BrandNotFoundException("Brand not found with ID: " + brandId));
        return brandToBrandDTO(brand);
    }

    public Brand getBrandById(Long brandId){
        return brandRepo.findById(brandId)
                .orElseThrow(() -> new BrandNotFoundException("Brand not found with ID: " + brandId));
    }

    public List<Brand> getBrands() {
        return brandRepo.findAll();
    }

    public List<BrandDTO> getBrandDTOs(BrandFilterDTO filter) {
        List<Brand> brands = getBrands();

        if (filter == null) {
            return brands.stream()
                    .map(this::brandToBrandDTO)
                    .toList();
        } else {
            List<String> productTypes = filter.getProductTypes();
            boolean includeSale = productTypes.contains("Sale");
            boolean includeTool = productTypes.contains("Tool");
            boolean includeEquipment = productTypes.contains("Equipment");

            List<Brand> filteredBrands;

            if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
                filteredBrands = brandRepo.findDistinctBrandsFilteredByTypeAndKeyword(
                        includeSale, includeTool, includeEquipment, filter.getKeyword()
                );
            } else {
                filteredBrands = brandRepo.findDistinctBrandsForActiveProductsWithActiveInstances(
                        includeSale, includeTool, includeEquipment
                );
            }

            return filteredBrands.stream()
                    .map(this::brandToBrandDTO)
                    .toList();
        }
    }

    public Brand findOrCreateBrand(String brandName){
        return brandRepo.findByBrandName(brandName)
                .orElseGet(() -> {
                    Brand newBrand = new Brand();
                    isValid(brandName);
                    newBrand.setBrandName(brandName);
                    try {
                        return brandRepo.save(newBrand);
                    } catch (Exception e) {
                        throw new BrandCreationException("Failed to create Brand.", e);
                    }
                });
    }

    public BrandDTO createBrand(BrandDTO brandDTO) {
        isValid(brandDTO.getName());

        if (brandAlreadyExists(brandDTO)) {
            throw new BrandCreationException("Brand already exists.");
        }
        Brand brand = new Brand();
        Brand brandToSave = brandDtoToBrandConversion(brand, brandDTO);
        try {
            Brand createdBrand = brandRepo.save(brandToSave);
            return brandToBrandDTO(createdBrand);
        } catch (Exception e) {
            throw new BrandCreationException("Failed to create the Brand.", e);
        }
    }

    public BrandDTO updateBrand(Long brandId, BrandDTO brandDTO){
        try{
            Brand existingBrand = getBrandById(brandId);
            boolean updated = false;
            if(brandDTO.getName() != null) {
                existingBrand.setBrandName(brandDTO.getName());
                updated = true;
            }
            if(!updated) {
                throw new BrandUpdateException("No valid fields provided for update.");
            }
            Brand updatedBrand = brandRepo.save(existingBrand);
            return brandToBrandDTO(updatedBrand);
        } catch (Exception e) {
            throw new BrandUpdateException("Failed to update existing Brand.", e);
        }
    }

    public void deleteBrand(Long brandId) {
        Brand brand = getBrandById(brandId);
        long associatedProductsCount = countProductsByBrand(brand);
        if(associatedProductsCount > 0) {
            throw new BrandDeleteRestrictionException("You cannot remove Brand because some products are using it as an attribute.");
        }
        try {
            brandRepo.deleteById(brandId);
        } catch (Exception e) {
            throw new BrandDeletionException("Failed to delete existing Brand", e);
        }
    }

    private boolean brandAlreadyExists(BrandDTO brandDTO) {
        return brandRepo.findByBrandName(brandDTO.getName()).isPresent();
    }

    private BrandDTO brandToBrandDTO(Brand brand) {
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setId(brand.getId());
        brandDTO.setName(brand.getBrandName());
        return brandDTO;
    }

    private Brand brandDtoToBrandConversion(Brand brand, BrandDTO brandDTO) {
        if(brandDTO.getName() != null) {
            brand.setBrandName(brandDTO.getName());
        }

        return brand;
    }

    private void isValid(String brandName) {
        if(brandName == null) {
            throw new BrandCreationException("BrandName cannot be null.");
        } else if (brandName.length() < 2) {
            throw new BrandCreationException("BrandName requires 2+ characters.");
        }
    }

    public long countProductsByBrand(Brand brand) {
        long totalProductCount = 0;
        totalProductCount += saleProductRepo.countByBrand(brand);
        totalProductCount += toolProductRepo.countByBrand(brand);
        totalProductCount += equipmentProductRepo.countByBrand(brand);
        return totalProductCount;
    }
}
