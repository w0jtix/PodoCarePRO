package com.podocare.PodoCareWebsite.controller.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/equipmentProductInstance")
public class EquipmentProductInstanceController {
    private final EquipmentProductInstanceService equipmentProductInstanceService;

    @GetMapping("/{equipmentProductInstanceId}")
    public ResponseEntity<EquipmentProductInstance> getEquipmentProductInstanceById(@PathVariable Long equipmentProductInstanceId) {
        EquipmentProductInstance equipmentProductInstance = equipmentProductInstanceService.getEquipmentProductInstanceById(equipmentProductInstanceId);
        return new ResponseEntity<>(equipmentProductInstance, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<EquipmentProductInstance> createInstance(@RequestBody EquipmentProductInstanceDTO equipmentProductInstanceDTO) {
        EquipmentProductInstance newEquipmentProductInstance = equipmentProductInstanceService.createInstance(equipmentProductInstanceDTO);
        return new ResponseEntity<>(newEquipmentProductInstance, HttpStatus.CREATED);
    }

    @PostMapping("/createIndependentEquipmentProductInstance")
    public ResponseEntity<EquipmentProductInstance> createIndependentInstance(@RequestBody EquipmentProductInstanceDTO equipmentProductInstanceDTO) {
        EquipmentProductInstance newEquipmentProductInstance = equipmentProductInstanceService.createIndependentInstance(equipmentProductInstanceDTO);
        return new ResponseEntity<>(newEquipmentProductInstance, HttpStatus.CREATED);
    }

    @PutMapping("/{equipmentProductInstanceId}")
    public ResponseEntity<EquipmentProductInstance> updateEquipmentProductInstance(@PathVariable Long equipmentProductInstanceId,
                                                                         @RequestBody EquipmentProductInstanceDTO instanceDTO) {
        EquipmentProductInstance updatedEquipmentProductInstance = equipmentProductInstanceService.updateInstance(equipmentProductInstanceId, instanceDTO);
        return new ResponseEntity<>(updatedEquipmentProductInstance, HttpStatus.OK);
    }

    @DeleteMapping("/{equipmentProductInstanceId}")
    public ResponseEntity<String> deleteEquipmentProductInstance(@PathVariable Long equipmentProductInstanceId) {
        equipmentProductInstanceService.deleteInstance(equipmentProductInstanceId);
        return new ResponseEntity<>("EquipmentProductInstance successfully deleted.", HttpStatus.OK);
    }

    @GetMapping("/{equipmentProductInstanceId}/instancesAvailable")
    public ResponseEntity<Long> countEquipmentProductInstancesAvailable(@PathVariable Long equipmentProductInstanceId) {
        Long availableCount = equipmentProductInstanceService.countEquipmentProductInstancesAvailable(equipmentProductInstanceId);
        return new ResponseEntity<>(availableCount, HttpStatus.OK);
    }
}
