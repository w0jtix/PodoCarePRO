package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.DiscountDTO;
import com.podocare.PodoCareWebsite.service.DiscountService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/discounts")
public class DiscountController {
    private final DiscountService discountService;

    @GetMapping("/all")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<DiscountDTO>> getDiscounts() {
        List<DiscountDTO> discountDTOList = discountService.getDiscounts();
        return new ResponseEntity<>(discountDTOList, discountDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<DiscountDTO> getDiscountById(@PathVariable(value = "id") Long id){
        DiscountDTO discount = discountService.getDiscountById(id);
        return new ResponseEntity<>(discount, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<DiscountDTO> createDiscount(@NonNull @RequestBody DiscountDTO discount) {
        DiscountDTO newDiscount = discountService.createDiscount(discount);
        return new ResponseEntity<>(newDiscount, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<DiscountDTO> updateDiscount(@PathVariable(value = "id") Long id, @NonNull @RequestBody DiscountDTO discount){
        DiscountDTO saved = discountService.updateDiscount(id, discount);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteDiscount(@PathVariable(value = "id") Long id) {
        discountService.deleteDiscountById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
