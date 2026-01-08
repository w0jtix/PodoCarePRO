package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.BrandDTO;
import com.podocare.PodoCareWebsite.DTO.request.KeywordFilterDTO;

import java.util.List;

public interface BrandService {

    BrandDTO getBrandById (Long id);

    List<BrandDTO> getBrands(KeywordFilterDTO filter);

    BrandDTO createBrand(BrandDTO brand);

    List<BrandDTO> createBrands(List<BrandDTO> brands);

    BrandDTO updateBrand(Long id, BrandDTO brand);

    void deleteBrandById(Long id);
}
