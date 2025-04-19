package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand.*;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.SupplierDTO;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.repo.order.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.order.OrderRepo;
import com.podocare.PodoCareWebsite.repo.order.SupplierRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.EquipmentProductInstanceRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.SaleProductInstanceRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.ToolProductInstanceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupplierService {
    @Autowired
    private SupplierRepo supplierRepo;
    @Autowired
    SaleProductInstanceRepo saleProductInstanceRepo;
    @Autowired
    EquipmentProductInstanceRepo equipmentProductInstanceRepo;
    @Autowired
    ToolProductInstanceRepo toolProductInstanceRepo;
    @Autowired
    OrderRepo orderRepo;

    public SupplierDTO getSupplierDTOById(Long supplierId){
        Supplier supplier = supplierRepo.findById(supplierId)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID: " + supplierId));
        return supplierToSupplierDTO(supplier);
    }

    public Supplier getSupplierById(Long supplierId){
        return supplierRepo.findById(supplierId)
                .orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID: " + supplierId));
    }

    public List<Supplier> getSuppliers() {
        return supplierRepo.findAll();
    }

    public List<SupplierDTO> getSupplierDTOs() {
        List<Supplier> supplierList = getSuppliers();
        return supplierList.stream()
                .map(this::supplierToSupplierDTO)
                .toList();
    }

    public Supplier findOrCreateSupplier(String supplierName){
        return supplierRepo.findBySupplierName(supplierName)
                .orElseGet(() -> {
                    Supplier newSupplier = new Supplier();
                    isValid(supplierName);
                    newSupplier.setSupplierName(supplierName);
                    newSupplier.setWebsiteUrl(""); // do edita wrazie co
                    try {
                        return supplierRepo.save(newSupplier);
                    } catch (Exception e) {
                        throw new SupplierCreationException("Failed to create Supplier.", e);
                    }
                });
    }

    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        isValid(supplierDTO.getName());

        if(supplierAlreadyExists(supplierDTO)){
            throw new SupplierCreationException("Supplier already exists.");
        }

        Supplier supplier = new Supplier();
        Supplier supplierToSave = supplierDtoToSupplierConversion(supplier, supplierDTO);
        try {
            Supplier newSupplier = supplierRepo.save(supplierToSave);
            return supplierToSupplierDTO(newSupplier);
        } catch (Exception e) {
            throw new SupplierCreationException("Failed to create Supplier.", e);
        }
    }

    public SupplierDTO updateSupplier(Long supplierId, SupplierDTO supplierDTO){
        try {
            Supplier existingSupplier = getSupplierById(supplierId);
            boolean updated = false;
            if(supplierDTO.getName() != null) {
                existingSupplier.setSupplierName(supplierDTO.getName());
                updated = true;
            }
            if(supplierDTO.getWebsiteUrl() != null) {
                existingSupplier.setWebsiteUrl(supplierDTO.getWebsiteUrl());
                updated = true;
            }
            if(!updated) {
                throw new SupplierUpdateException("No valid fields provided for update.");
            }
           Supplier updatedSupplier = supplierRepo.save(existingSupplier);
            return supplierToSupplierDTO(updatedSupplier);
        } catch (Exception e) {
            throw new SupplierCreationException("Failed to update existing Supplier.", e);
        }
    }

    public void deleteSupplier(Long supplierId) {
        Supplier supplier = getSupplierById(supplierId);
        long associatedProductsCount = countProductsBySupplier(supplier);
        try {
            if(associatedProductsCount > 0) {
                supplier.setDeleted(true);
                supplierRepo.save(supplier);
            } else {
                supplierRepo.deleteById(supplierId);
            }
        } catch (Exception e) {
            throw new SupplierDeletionException("Failed to delete existing Supplier", e);
        }
    }

    public boolean supplierAlreadyExists(SupplierDTO supplierDTO) {
        return supplierRepo.findBySupplierName(supplierDTO.getName()).isPresent();
    }

    private Supplier supplierDtoToSupplierConversion(Supplier supplier, SupplierDTO supplierDTO) {
        if(supplierDTO.getName() != null) {
            supplier.setSupplierName(supplierDTO.getName());
        }
        if(supplierDTO.getWebsiteUrl() != null) {
            supplier.setWebsiteUrl(supplierDTO.getWebsiteUrl());
        }
        return supplier;
    }

    private SupplierDTO supplierToSupplierDTO(Supplier supplier) {
        SupplierDTO supplierDTO = new SupplierDTO();
        supplierDTO.setName(supplier.getSupplierName());
        supplierDTO.setId(supplier.getId());
        supplierDTO.setWebsiteUrl(supplier.getWebsiteUrl());
        return supplierDTO;
    }

    private void isValid(String supplierName) {
        if(supplierName == null) {
            throw new SupplierCreationException("SupplierName cannot be null.");
        } else if (supplierName.length() < 2) {
            throw new SupplierCreationException("SupplierName requires 2+ characters.");
        }
    }

    public long countProductsBySupplier(Supplier supplier) {
        long totalProductCount = 0;

        totalProductCount += orderRepo.countProductsBySupplier(supplier);
        return totalProductCount;
    }
}
