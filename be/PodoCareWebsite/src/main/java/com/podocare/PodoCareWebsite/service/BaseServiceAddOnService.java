package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.BaseServiceAddOnDTO;

import java.util.List;

public interface BaseServiceAddOnService {

    List<BaseServiceAddOnDTO> getAllBaseServiceAddOns();

    BaseServiceAddOnDTO createBaseServiceAddOn(BaseServiceAddOnDTO baseServiceAddOn);

    BaseServiceAddOnDTO updateBaseServiceAddOn(Long id, BaseServiceAddOnDTO baseServiceAddOn);

    void deleteBaseServiceAddOnById(Long id);
}
