package com.podocare.PodoCareWebsite.service.impl;


import com.podocare.PodoCareWebsite.DTO.BaseServiceDTO;
import com.podocare.PodoCareWebsite.DTO.BaseServiceVariantDTO;
import com.podocare.PodoCareWebsite.DTO.request.KeywordFilterDTO;
import com.podocare.PodoCareWebsite.DTO.request.ServiceFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.BaseService;
import com.podocare.PodoCareWebsite.model.BaseServiceVariant;
import com.podocare.PodoCareWebsite.repo.BaseServiceRepo;
import com.podocare.PodoCareWebsite.repo.VisitItemRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.BaseServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class BaseServiceServiceImpl implements BaseServiceService {

    private final BaseServiceRepo baseServiceRepo;
    private final VisitItemRepo visitItemRepo;
    private final AuditLogService auditLogService;

    @Override
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
            BaseServiceDTO savedService = new BaseServiceDTO(baseServiceRepo.save(service.toEntity()));
            auditLogService.logCreate("BaseService", savedService.getId(), savedService.getName(), savedService);
            return savedService;
        } catch (Exception e) {
            throw new CreationException("Failed to create Service. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public BaseServiceDTO updateBaseService(Long id, BaseServiceDTO serviceDTO) {
        try {
            BaseService existingService = baseServiceRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

            BaseServiceDTO oldServiceSnapshot = new BaseServiceDTO(existingService);

            checkForDuplicatesExcludingCurrent(serviceDTO, id);

            Set<Long> newVariantIds = serviceDTO.getVariants().stream()
                    .map(BaseServiceVariantDTO::getId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Set<BaseServiceVariantDTO> variantsToKeep = new HashSet<>();

            for (BaseServiceVariant existingVariant : existingService.getVariants()) {
                if (!newVariantIds.contains(existingVariant.getId())) {

                    if (visitItemRepo.existsByServiceVariantId(existingVariant.getId())) {
                        existingVariant.softDelete();
                        variantsToKeep.add(new BaseServiceVariantDTO(existingVariant));
                    }
                }
            }

            serviceDTO.getVariants().addAll(variantsToKeep);

            serviceDTO.setId(id);
            BaseServiceDTO savedService = new BaseServiceDTO(baseServiceRepo.save(serviceDTO.toEntity()));

            auditLogService.logUpdate("BaseService", id, oldServiceSnapshot.getName(), oldServiceSnapshot, savedService);
            return savedService;

        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new UpdateException("Failed to update Service, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteBaseServiceById(Long id) {
        try {
            BaseService service = baseServiceRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

            if (service.getIsDeleted()) {
                throw new DeletionException("Service is already soft-deleted.");
            }

            BaseServiceDTO serviceSnapshot = new BaseServiceDTO(service);

            if (hasVisitItemReferences(id)) {
                service.softDelete();
                baseServiceRepo.save(service);
            } else {
                baseServiceRepo.deleteById(id);
            }

            auditLogService.logDelete("BaseService", id, serviceSnapshot.getName(), serviceSnapshot);
        } catch (ResourceNotFoundException | DeletionException e) {
            throw e;
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Service, Reason: " + e.getMessage(), e);
        }
    }

    private boolean hasVisitItemReferences(Long serviceId) {
        return visitItemRepo.existsByServiceId(serviceId);
    }

    private void checkForDuplicatesExcludingCurrent(BaseServiceDTO serviceDTO, Long currentId) {
        Optional<BaseService> duplicate = baseServiceRepo.findByName(serviceDTO.getName());

        if(duplicate.isPresent() && !duplicate.get().getId().equals(currentId)) {
            throw new UpdateException("Service with provided details already exsits.");
        }
    }
}
