package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.BaseServiceAddOnDTO;
import com.podocare.PodoCareWebsite.DTO.BaseServiceDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.BaseService;
import com.podocare.PodoCareWebsite.model.BaseServiceAddOn;
import com.podocare.PodoCareWebsite.repo.BaseServiceAddOnRepo;
import com.podocare.PodoCareWebsite.service.BaseServiceAddOnService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class BaseServiceAddOnServiceImpl implements BaseServiceAddOnService {

    private final BaseServiceAddOnRepo baseServiceAddOnRepo;

    public BaseServiceAddOnDTO getBaseServiceAddOnById(Long id) {
        return new BaseServiceAddOnDTO(baseServiceAddOnRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceAddOn not found with given id: " + id)));
    }

    @Override
    public List<BaseServiceAddOnDTO> getAllBaseServiceAddOns() {

        return baseServiceAddOnRepo.findAll().stream()
                .map(BaseServiceAddOnDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BaseServiceAddOnDTO createBaseServiceAddOn(BaseServiceAddOnDTO baseServiceAddOn) {
        try {
            if(baseServiceAddOnRepo.existsByName(baseServiceAddOn.getName())) {
                throw new CreationException("ServiceAddOn already exists: " + baseServiceAddOn.getName());
            }
            return new BaseServiceAddOnDTO(baseServiceAddOnRepo.save(baseServiceAddOn.toEntity()));
        }  catch (Exception e) {
            throw new CreationException("Failed to create ServiceAddOn. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public BaseServiceAddOnDTO updateBaseServiceAddOn(Long id, BaseServiceAddOnDTO baseServiceAddOn) {
        try{
            getBaseServiceAddOnById(id);
            checkForDuplicatesExcludingCurrent(baseServiceAddOn, id);
            baseServiceAddOn.setId(id);
            return new BaseServiceAddOnDTO(baseServiceAddOnRepo.save(baseServiceAddOn.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to updated ServiceAddOn, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteBaseServiceAddOnById(Long id) {
        try{
            BaseServiceAddOn addOn = baseServiceAddOnRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceAddOn not found with id: " + id));
            baseServiceAddOnRepo.deleteById(id);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete ServiceAddOn, Reason: " + e.getMessage(), e);
        }
    }

    private void checkForDuplicatesExcludingCurrent(BaseServiceAddOnDTO serviceDTO, Long currentId) {
        Optional<BaseServiceAddOn> duplicate = baseServiceAddOnRepo.findByName(serviceDTO.getName());

        if(duplicate.isPresent() && !duplicate.get().getId().equals(currentId)) {
            throw new UpdateException("ServiceAddOn with provided details already exsits.");
        }
    }
}
