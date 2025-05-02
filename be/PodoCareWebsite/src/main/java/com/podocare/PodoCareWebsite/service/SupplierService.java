package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.DTO.SupplierDTO;
import com.podocare.PodoCareWebsite.repo.SupplierRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepo supplierRepo;

    public SupplierDTO getSupplierById(Long supplierId){
        return new SupplierDTO(supplierRepo.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with given id." + supplierId)));
    }

    public List<SupplierDTO> getSuppliers() {
        return supplierRepo.findAll()
                .stream()
                .map(SupplierDTO::new)
                .toList();
    }

    @Transactional
    public SupplierDTO createSupplier(SupplierDTO supplierToCreate) {
        try{
            if (supplierAlreadyExists(supplierToCreate)) {
                throw new CreationException("Supplier already exists.");
            }
            return new SupplierDTO(supplierRepo.save(supplierToCreate.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create Supplier. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public SupplierDTO updateSupplier(Long supplierId, SupplierDTO updatedSupplier) {
        try{
            getSupplierById(supplierId);
            return new SupplierDTO(supplierRepo.save(updatedSupplier.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update Supplier, Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteSupplierById(Long supplierId) {
        try{
            supplierRepo.deleteById(getSupplierById(supplierId).getId());
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Supplier, Reason: " + e.getMessage(), e);
        }
    }

    private boolean supplierAlreadyExists(SupplierDTO supplierDTO) {
        return supplierRepo.findBySupplierName(supplierDTO.getName()).isPresent();
    }
}
