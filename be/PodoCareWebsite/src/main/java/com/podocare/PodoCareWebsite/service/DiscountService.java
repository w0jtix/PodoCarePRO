package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.DiscountDTO;

import java.util.List;

public interface DiscountService {

    DiscountDTO getDiscountById(Long id);

    List<DiscountDTO> getDiscounts();

    DiscountDTO createDiscount(DiscountDTO discount);

    DiscountDTO updateDiscount(Long id, DiscountDTO discount);

    void deleteDiscountById(Long id);

}
