package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.DTO.SupplyManagerDTO;
import com.podocare.PodoCareWebsite.service.SupplyManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/supply")
public class SupplyManagerController {

    private final SupplyManagerService supplyManagerService;

    @GetMapping("/{productId}")
    public ResponseEntity<SupplyManagerDTO> getManagerByProductId(@PathVariable Long productId) {
        SupplyManagerDTO manager = supplyManagerService.getManagerByProductId(productId);
        return new ResponseEntity<>(manager, manager != null ? HttpStatus.OK : HttpStatus.NOT_FOUND);
    }

    @PostMapping("/get")
    public ResponseEntity<List<SupplyManagerDTO>> getManagerByProductId(@RequestBody FilterDTO filterDTO) {
        List<SupplyManagerDTO> managerList = supplyManagerService.getManagersByProductIds(filterDTO);
        return new ResponseEntity<>(managerList, managerList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<Void> updateManager(@RequestBody SupplyManagerDTO supplyManagerDTO) {
        supplyManagerService.updateSupply(supplyManagerDTO);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
