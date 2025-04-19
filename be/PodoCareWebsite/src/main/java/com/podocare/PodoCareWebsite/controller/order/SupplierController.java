package com.podocare.PodoCareWebsite.controller.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.SupplierDTO;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.service.order.SupplierService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getSuppliers() {
        List<SupplierDTO> supplierList = supplierService.getSupplierDTOs();
        return new ResponseEntity<>(supplierList, supplierList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable Long supplierId){
        SupplierDTO supplier = supplierService.getSupplierDTOById(supplierId);
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createSupplier(@RequestBody SupplierDTO supplierDTO) {
        SupplierDTO newSupplier = supplierService.createSupplier(supplierDTO);
        return new ResponseEntity<>(newSupplier, HttpStatus.CREATED);
    }

    @PutMapping("/{supplierId}")
    public ResponseEntity<SupplierDTO> updateSupplier(@PathVariable Long supplierId, @RequestBody SupplierDTO supplierDTO) {
        SupplierDTO updatedSupplier = supplierService.updateSupplier(supplierId, supplierDTO);
        return new ResponseEntity<>(updatedSupplier, HttpStatus.OK);
    }

    @DeleteMapping("/{supplierId}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long supplierId) {
        supplierService.deleteSupplier(supplierId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
