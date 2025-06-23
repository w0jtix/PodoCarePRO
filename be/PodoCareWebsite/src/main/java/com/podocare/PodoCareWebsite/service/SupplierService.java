package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.SupplierDTO;

import java.util.List;

public interface SupplierService {

    SupplierDTO getSupplierById(Long id);

    List<SupplierDTO> getSuppliers();

    SupplierDTO createSupplier(SupplierDTO supplier);

    SupplierDTO updateSupplier(Long id, SupplierDTO supplier);

    void deleteSupplierById(Long id);

}
