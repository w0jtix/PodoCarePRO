package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.SupplierDTO;
import com.podocare.PodoCareWebsite.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getSuppliers() {
        List<SupplierDTO> supplierList = supplierService.getSuppliers();
        return new ResponseEntity<>(supplierList, supplierList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable Long supplierId){
        SupplierDTO supplier = supplierService.getSupplierById(supplierId);
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<SupplierDTO> createSupplier(@RequestBody SupplierDTO supplierToCreate) {
        SupplierDTO newSupplier = supplierService.createSupplier(supplierToCreate);
        return new ResponseEntity<>(newSupplier, HttpStatus.CREATED);
    }

    @PutMapping("/{supplierId}")
    public ResponseEntity<SupplierDTO> updateSupplier(@PathVariable Long supplierId, @RequestBody SupplierDTO updatedSupplier) {
        SupplierDTO supplier = supplierService.updateSupplier(supplierId, updatedSupplier);
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    @DeleteMapping("/{supplierId}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long supplierId) {
        supplierService.deleteSupplierById(supplierId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
