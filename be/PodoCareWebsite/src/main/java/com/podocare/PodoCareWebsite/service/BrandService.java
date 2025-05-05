package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.DTO.BrandDTO;
import com.podocare.PodoCareWebsite.repo.BrandRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepo brandRepo;

    public BrandDTO getBrandById(Long brandId){
        return new BrandDTO(brandRepo.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with given id." + brandId)));
    }

    public List<BrandDTO> getBrands(FilterDTO filter) {
        if(isNull(filter)) {
            filter = new FilterDTO();
        }
        return brandRepo.findAllWithFilters(filter.getKeyword())
                .stream()
                .map(BrandDTO::new)
                .toList();
    }

    @Transactional
    public BrandDTO createBrand(BrandDTO brandToCreate) {
        try{
            if (brandAlreadyExists(brandToCreate)) {
                throw new CreationException("Brand already exists.");
            }
             return new BrandDTO(brandRepo.save(brandToCreate.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create Brand. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public BrandDTO updateBrand(Long brandId, BrandDTO updatedBrand) {
        try{
            getBrandById(brandId);
            return new BrandDTO(brandRepo.save(updatedBrand.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Brand, Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteBrandById(Long brandId) {
        try{
            brandRepo.deleteById(getBrandById(brandId).getId());
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Brand, Reason: " + e.getMessage(), e);
        }
    }

    private boolean brandAlreadyExists(BrandDTO brandDTO) {
        return brandRepo.findByBrandName(brandDTO.getName()).isPresent();
    }
}
