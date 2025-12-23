package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.BaseServiceDTO;
import com.podocare.PodoCareWebsite.DTO.request.KeywordFilterDTO;
import com.podocare.PodoCareWebsite.DTO.request.ServiceFilterDTO;

import java.util.List;

public interface BaseServiceService {

    BaseServiceDTO getBaseServiceById(Long id);

    List<BaseServiceDTO> getBaseServices(ServiceFilterDTO keyword);

    List<BaseServiceDTO> getBaseServicesByCategoryId(Long categoryId);

    BaseServiceDTO createBaseService(BaseServiceDTO service);

    BaseServiceDTO updateBaseService(Long id, BaseServiceDTO serviceDTO);

    void deleteBaseServiceById(Long id);
}
