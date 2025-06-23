package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.SupplierDTO;
import com.podocare.PodoCareWebsite.service.SupplierService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.Objects.nonNull;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping("/search")
    public ResponseEntity<List<SupplierDTO>> getSuppliers() {
        List<SupplierDTO> supplierList = supplierService.getSuppliers();
        return new ResponseEntity<>(supplierList, supplierList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable(value = "id") Long id){
        SupplierDTO supplier = supplierService.getSupplierById(id);
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<SupplierDTO> createSupplier(@NonNull @RequestBody SupplierDTO supplier) {
        SupplierDTO newSupplier = supplierService.createSupplier(supplier);
        return new ResponseEntity<>(newSupplier, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDTO> updateSupplier(@PathVariable(value = "id") Long id, @NonNull @RequestBody SupplierDTO supplier) {
        SupplierDTO saved = supplierService.updateSupplier(id, supplier);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable(value = "id") Long id) {
        supplierService.deleteSupplierById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
