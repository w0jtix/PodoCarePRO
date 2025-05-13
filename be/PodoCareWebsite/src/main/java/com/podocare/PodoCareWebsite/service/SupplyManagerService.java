package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.DTO.SupplyManagerDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.SupplyManager;
import com.podocare.PodoCareWebsite.repo.SupplyManagerRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class SupplyManagerService {

    private final SupplyManagerRepo supplyManagerRepo;

    public SupplyManagerDTO getManagerByProductId(Long productId) {
        return new SupplyManagerDTO(supplyManagerRepo.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with given id.")));
    }

    public List<SupplyManagerDTO> getManagersByProductIds (FilterDTO filterDTO) {
        return filterDTO.getProductIds().stream()
                .map(this::getManagerByProductId)
                .toList();
    }

    public void createManager(Long productId, Integer supply) {
        try{
            if(supply == null ){
                supplyManagerRepo.save(new SupplyManager(productId));
            } else {
                supplyManagerRepo.save(new SupplyManager(productId, supply));
            }
        } catch (Exception e) {
            throw new CreationException("Failed to create SupplyManager for productId: " + productId + ". Reason: " + e.getMessage(), e);
        }
    }

    public void changeSupply(SupplyManagerDTO requestDTO) {
        try {
            SupplyManagerDTO managerDTO =  getManagerByProductId(requestDTO.getProductId());
            managerDTO.setSupply(requestDTO.getSupply());
            supplyManagerRepo.save(managerDTO.toEntity());
        } catch (Exception e) {
            throw new UpdateException("Failed to update SupplyManager for productId: " + requestDTO.getProductId() + ". Reason: " + e.getMessage(), e);
        }
    }

    public void updateSupply(SupplyManagerDTO requestDTO) { // in this case supply means by how many to adjust
        try {
            SupplyManagerDTO managerDTO =  getManagerByProductId(requestDTO.getProductId());
            if(requestDTO.getAction().equals("increment")) {
                managerDTO.setSupply(managerDTO.getSupply() + requestDTO.getSupply()); //here
            } else if (requestDTO.getAction().equals("decrement")) {
                managerDTO.setSupply(managerDTO.getSupply() - requestDTO.getSupply()); //here
            }
            supplyManagerRepo.save(managerDTO.toEntity());
        } catch (Exception e) {
            throw new UpdateException("Failed to update SupplyManager for productId: " + requestDTO.getProductId() + ". Reason: " + e.getMessage(), e);
        }
    }

    public void deleteManagerByProductId(Long productId) {
        try{
            supplyManagerRepo.deleteById(getManagerByProductId(productId).getId());
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Manager, Reason: " + e.getMessage(), e);
        }
    }
}
