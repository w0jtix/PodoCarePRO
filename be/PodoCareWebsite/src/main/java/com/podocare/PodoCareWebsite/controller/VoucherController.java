package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.VoucherDTO;
import com.podocare.PodoCareWebsite.DTO.request.VoucherFilterDTO;
import com.podocare.PodoCareWebsite.service.VoucherService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<VoucherDTO>> getVouchers(@RequestBody VoucherFilterDTO filter) {
        List<VoucherDTO> voucherDTOList = voucherService.getVouchers(filter);
        return new ResponseEntity<>(voucherDTOList, voucherDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VoucherDTO> getVoucherById(@PathVariable(value = "id") Long id){
        VoucherDTO voucher = voucherService.getVoucherById(id);
        return new ResponseEntity<>(voucher, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VoucherDTO> createVoucher(@NonNull @RequestBody VoucherDTO voucher) {
        VoucherDTO newVoucher = voucherService.createVoucher(voucher);
        return new ResponseEntity<>(newVoucher, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VoucherDTO> updateVoucher(@PathVariable(value = "id") Long id, @NonNull @RequestBody VoucherDTO voucher){
        VoucherDTO saved = voucherService.updateVoucher(id, voucher);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteVoucher(@PathVariable(value = "id") Long id) {
        voucherService.deleteVoucherById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}/hasReference")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Boolean> hasSaleReference(@PathVariable(value = "id") Long voucherId) {
        Boolean hasReference = voucherService.hasSaleReference(voucherId);
        return new ResponseEntity<>(hasReference, HttpStatus.OK);
    }
}
