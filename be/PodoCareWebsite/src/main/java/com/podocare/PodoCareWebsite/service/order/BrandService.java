package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand.BrandCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand.BrandDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand.BrandNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand.BrandDeleteRestrictionException;
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


    public Brand getBrandById(Long brandId){
        return brandRepo.findById(brandId)
                .orElseThrow(() -> new BrandNotFoundException("Brand not found with ID: " + brandId));
    }

    public List<Brand> getBrands() {
        return brandRepo.findAll();
    }

    public List<BrandDTO> getBrandDTOs() {
        List<Brand> brands = getBrands();

        return brands.stream()
                .map(brand -> new BrandDTO(brand.getId(), brand.getBrandName()))
                .toList();
    }

    public List<BrandDTO> getFilteredBrandDTOs(BrandFilterDTO filter) {
        List<String> productTypes = filter.getProductTypes();
        boolean includeSale = productTypes.contains("Sale");
        boolean includeTool = productTypes.contains("Tool");
        boolean includeEquipment = productTypes.contains("Equipment");

        List<Brand> filteredBrands = brandRepo.findDistinctBrandsForActiveProductsWithActiveInstances(includeSale, includeTool, includeEquipment);

        return filteredBrands.stream()
                .map(brand -> new BrandDTO(brand.getId(), brand.getBrandName()))
                .toList();
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

    public Brand createBrand(BrandDTO brandDTO) {
        isValid(brandDTO.getBrandName());

        if (brandAlreadyExists(brandDTO)) {
            throw new BrandCreationException("Brand already exists.");
        }
        Brand brand = new Brand();
        Brand brandToSave = brandDtoToBrandConversion(brand, brandDTO);

        try {
            return brandRepo.save(brandToSave);
        } catch (Exception e) {
            throw new BrandCreationException("Failed to create the Brand.", e);
        }
    }

    public Brand updateBrand(Long brandId, BrandDTO brandDTO){
        Brand existingBrand = getBrandById(brandId);

        isValid(brandDTO.getBrandName());
        Brand brandToUpdate = brandDtoToBrandConversion(existingBrand, brandDTO);

        try {
            return brandRepo.save(existingBrand);
        } catch (Exception e) {
            throw new BrandCreationException("Failed to update existing Brand.", e);
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

    public List<Brand> searchBrands(String keyword) {
        return brandRepo.searchBrands(keyword);
    }

    private boolean brandAlreadyExists(BrandDTO brandDTO) {
        return brandRepo.findByBrandName(brandDTO.getBrandName()).isPresent();
    }

    private Brand brandDtoToBrandConversion(Brand brand, BrandDTO brandDTO) {
        brand.setBrandName(brandDTO.getBrandName());
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
