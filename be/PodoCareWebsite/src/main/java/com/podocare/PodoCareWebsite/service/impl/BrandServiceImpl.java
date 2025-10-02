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
            return new BrandDTO(brandRepo.save(brand.toEntity()));
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
            getBrandById(id);

            checkForDuplicatesExcludingCurrent(brand, id);
            brand.setId(id);
            return new BrandDTO(brandRepo.save(brand.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Brand, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteBrandById(Long id) {
        try{
            brandRepo.deleteById(getBrandById(id).getId());
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
