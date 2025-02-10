package com.podocare.PodoCareWebsite.controller.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.DTOs.SupplierDTO;
import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.service.order.SupplierService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@AllArgsConstructor
@RequestMapping("/suppliers")
public class SupplierController {

    @Autowired
    SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getSuppliers() {
        List<SupplierDTO> supplierList = supplierService.getAllSuppliers();
        return new ResponseEntity<>(supplierList, supplierList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable Long supplierId){
        Supplier supplier = supplierService.getSupplierById(supplierId);
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<?> createSupplier(@RequestBody SupplierDTO supplierDTO) {
        SupplierDTO newSupplierDTO = supplierService.createSupplier(supplierDTO);
        return new ResponseEntity<>(newSupplierDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{supplierId}")
    public ResponseEntity<Supplier> updateProduct(@PathVariable Long supplierId, @RequestBody SupplierDTO supplierDTO) {
        Supplier updatedSupplier = supplierService.updateSupplier(supplierId, supplierDTO);
        return new ResponseEntity<>(updatedSupplier, HttpStatus.OK);
    }

    @DeleteMapping("/{supplierId}") //OK
    public ResponseEntity<String> deleteSupplier(@PathVariable Long supplierId) {

            supplierService.deleteSupplier(supplierId);
            return new ResponseEntity<>("Supplier successfully deleted.", HttpStatus.OK);
    }
}
