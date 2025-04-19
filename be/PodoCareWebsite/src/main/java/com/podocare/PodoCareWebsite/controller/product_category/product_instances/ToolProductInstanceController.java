package com.podocare.PodoCareWebsite.controller.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.*;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/toolProductInstance")
public class ToolProductInstanceController {

    private final ToolProductInstanceService toolProductInstanceService;

    @GetMapping("/{toolProductInstanceId}")
    public ResponseEntity<ToolProductInstance> getToolProductInstanceById(@PathVariable Long toolProductInstanceId) {
        ToolProductInstance toolProductInstance = toolProductInstanceService.getToolProductInstanceById(toolProductInstanceId);
        return new ResponseEntity<>(toolProductInstance, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ToolProductInstance> createInstance(@RequestBody ToolProductInstanceDTO toolProductInstanceDTO) {
        ToolProductInstance newToolProductInstance = toolProductInstanceService.createInstance(toolProductInstanceDTO);
        return new ResponseEntity<>(newToolProductInstance, HttpStatus.CREATED);
    }

    @PostMapping("/createIndependentToolProductInstance")
    public ResponseEntity<ToolProductInstance> createIndependentInstance(@RequestBody ToolProductInstanceDTO toolProductInstanceDTO) {
        ToolProductInstance newToolProductInstance = toolProductInstanceService.createIndependentInstance(toolProductInstanceDTO);
        return new ResponseEntity<>(newToolProductInstance, HttpStatus.CREATED);
    }

    @PutMapping("/{toolProductInstanceId}")
    public ResponseEntity<ToolProductInstance> updateToolProductInstance(@PathVariable Long toolProductInstanceId,
                                                                         @RequestBody ToolProductInstanceDTO instanceDTO) {
        ToolProductInstance updatedToolProductInstance = toolProductInstanceService.updateInstance(toolProductInstanceId, instanceDTO);
        return new ResponseEntity<>(updatedToolProductInstance, HttpStatus.OK);
    }

    @DeleteMapping("/{toolProductInstanceId}")
    public ResponseEntity<String> deleteToolProductInstance(@PathVariable Long toolProductInstanceId) {
        toolProductInstanceService.deleteInstance(toolProductInstanceId);
        return new ResponseEntity<>("ToolProductInstance successfully deleted.", HttpStatus.OK);
    }

    @GetMapping("/{toolProductInstanceId}/instancesAvailable")
    public ResponseEntity<Long> countToolProductInstancesAvailable(@PathVariable Long toolProductInstanceId) {
        Long availableCount = toolProductInstanceService.countToolProductInstancesAvailable(toolProductInstanceId);
        return new ResponseEntity<>(availableCount, HttpStatus.OK);
    }
}
