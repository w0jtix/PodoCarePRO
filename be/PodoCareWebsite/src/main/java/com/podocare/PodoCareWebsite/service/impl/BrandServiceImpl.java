package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.BrandDTO;
import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.request.KeywordFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Brand;
import com.podocare.PodoCareWebsite.model.Product;
import com.podocare.PodoCareWebsite.repo.BrandRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepo brandRepo;
    private final AuditLogService auditLogService;

    @Override
    public BrandDTO getBrandById(Long id){
        return new BrandDTO(brandRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with given id: " + id)));
    }

    @Override
    public List<BrandDTO> getBrands(KeywordFilterDTO filter) {
        if(isNull(filter)) {
            filter = new KeywordFilterDTO();
        }
        return brandRepo.findAllWithFilters(
                        filter.getKeyword())
                .stream()
                .map(BrandDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BrandDTO createBrand(BrandDTO brand) {
        try{
            if (brandAlreadyExists(brand)) {
                throw new CreationException("Brand already exists: " + brand.getName());
            }
            BrandDTO savedBrand = new BrandDTO(brandRepo.save(brand.toEntity()));
            auditLogService.logCreate("Brand", savedBrand.getId(), savedBrand.getName(), savedBrand);
            return savedBrand;
        } catch (Exception e) {
            throw new CreationException("Failed to create Brand. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public List<BrandDTO> createBrands(List<BrandDTO> brands) {
        return brands.stream()
                .map(this::createBrand)
                .toList();
    }

    @Override
    @Transactional
    public BrandDTO updateBrand(Long id, BrandDTO brand) {
        try{
            BrandDTO oldBrandSnapshot = getBrandById(id);

            checkForDuplicatesExcludingCurrent(brand, id);
            brand.setId(id);
            BrandDTO savedBrand = new BrandDTO(brandRepo.save(brand.toEntity()));

            auditLogService.logUpdate("Brand", id, oldBrandSnapshot.getName(), oldBrandSnapshot, savedBrand);
            return savedBrand;
        } catch (Exception e) {
            throw new UpdateException("Failed to update Brand, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteBrandById(Long id) {
        try{
            BrandDTO brandSnapshot = getBrandById(id);
            brandRepo.deleteById(id);
            auditLogService.logDelete("Brand", id, brandSnapshot.getName(), brandSnapshot);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Brand, Reason: " + e.getMessage(), e);
        }
    }

    private boolean brandAlreadyExists(BrandDTO brandDTO) {
        return brandRepo.findByBrandName(brandDTO.getName()).isPresent();
    }

    private void checkForDuplicatesExcludingCurrent(BrandDTO brandDTO, Long currentId) {
        Optional<Brand> duplicate = brandRepo.findByBrandName(
                brandDTO.getName()
        );

        if (duplicate.isPresent() && !duplicate.get().getId().equals(currentId)) {
            throw new UpdateException("Brand with provided details already exists.");
        }
    }
}
