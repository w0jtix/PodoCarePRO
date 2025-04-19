package com.podocare.PodoCareWebsite.controller.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.SaleProductInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/saleProductInstance")
public class SaleProductInstanceController {

    private final SaleProductInstanceService saleProductInstanceService;

    @GetMapping("/{saleProductInstanceId}")
    public ResponseEntity<SaleProductInstance> getSaleProductInstanceById(@PathVariable Long id) {
        SaleProductInstance saleProductInstance = saleProductInstanceService.getSaleProductInstanceById(id);
        return new ResponseEntity<>(saleProductInstance, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<SaleProductInstance> createInstance(@RequestBody SaleProductInstanceDTO saleProductInstanceDTO) {
        SaleProductInstance newSaleProductInstance = saleProductInstanceService.createInstance(saleProductInstanceDTO);
        return new ResponseEntity<>(newSaleProductInstance, HttpStatus.CREATED);
    }

    @PostMapping("/createIndependentSaleProductInstance")
    public ResponseEntity<SaleProductInstance> createIndependentInstance(@RequestBody SaleProductInstanceDTO saleProductInstanceDTO) {
        SaleProductInstance newSaleProductInstance = saleProductInstanceService.createIndependentInstance(saleProductInstanceDTO);
        return new ResponseEntity<>(newSaleProductInstance, HttpStatus.CREATED);
    }


    @PutMapping("/{saleProductInstanceId}")
    public ResponseEntity<SaleProductInstance> updateSaleProductInstance(@PathVariable Long saleProductInstanceId,
                                                                         @RequestBody SaleProductInstanceDTO instanceDTO) {
        SaleProductInstance updatedSaleProductInstance = saleProductInstanceService.updateInstance(saleProductInstanceId, instanceDTO);
        return new ResponseEntity<>(updatedSaleProductInstance, HttpStatus.OK);
    }

    @DeleteMapping("/{saleProductInstanceId}")
    public ResponseEntity<String> deleteSaleProductInstance(@PathVariable Long saleProductInstanceId) {
        saleProductInstanceService.deleteInstance(saleProductInstanceId);
        return new ResponseEntity<>("SaleProductInstance successfully deleted.", HttpStatus.OK);
    }

    @GetMapping("/{saleProductInstanceId}/instancesAvailable")
    public ResponseEntity<Long> countSaleProductInstancesAvailable(@PathVariable Long saleProductInstanceId) {
        Long availableCount = saleProductInstanceService.countSaleProductInstancesAvailable(saleProductInstanceId);
        return new ResponseEntity<>(availableCount, HttpStatus.OK);
    }
}
