package com.podocare.PodoCareWebsite.service.impl;


import com.podocare.PodoCareWebsite.DTO.BaseServiceDTO;
import com.podocare.PodoCareWebsite.DTO.request.KeywordFilterDTO;
import com.podocare.PodoCareWebsite.DTO.request.ServiceFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.BaseService;
import com.podocare.PodoCareWebsite.repo.BaseServiceRepo;
import com.podocare.PodoCareWebsite.service.BaseServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class BaseServiceServiceImpl implements BaseServiceService {

    private final BaseServiceRepo baseServiceRepo;


    public BaseServiceDTO getBaseServiceById(Long id) {
        return new BaseServiceDTO(baseServiceRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with given id: " + id)));
    }

    @Override
    public List<BaseServiceDTO> getBaseServices(ServiceFilterDTO filter) {
        if(isNull(filter)) {
            filter = new ServiceFilterDTO();
        }

        return baseServiceRepo.findAllWithFilters(filter.getKeyword(), filter.getCategoryIds()).stream()
                .map(BaseServiceDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<BaseServiceDTO> getBaseServicesByCategoryId(Long categoryId) {
        return baseServiceRepo.findAllByCategoryId(categoryId).stream()
                .map(BaseServiceDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BaseServiceDTO createBaseService(BaseServiceDTO service) {
        try{
            if(baseServiceRepo.existsByName(service.getName())) {
                throw new CreationException("Service already exists: " + service.getName());
            }
            return new BaseServiceDTO(baseServiceRepo.save(service.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create Service. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public BaseServiceDTO updateBaseService(Long id, BaseServiceDTO service) {
        try{
            getBaseServiceById(id);

            checkForDuplicatesExcludingCurrent(service, id);
            service.setId(id);
            return new BaseServiceDTO(baseServiceRepo.save(service.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to updated Service, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteBaseServiceById(Long id) {
        try{
            BaseService service = baseServiceRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
            baseServiceRepo.deleteById(id);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Service, Reason: " + e.getMessage(), e);
        }
    }

    private void checkForDuplicatesExcludingCurrent(BaseServiceDTO serviceDTO, Long currentId) {
        Optional<BaseService> duplicate = baseServiceRepo.findByName(serviceDTO.getName());

        if(duplicate.isPresent() && !duplicate.get().getId().equals(currentId)) {
            throw new UpdateException("Service with provided details already exsits.");
        }
    }
}
