package com.podocare.PodoCareWebsite.controller.product_category;

import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.EquipmentProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.service.product_category.EquipmentProductService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/products/equipmentProducts")
public class EquipmentProductController{
    private final EquipmentProductService equipmentProductService;
    private final EquipmentProductInstanceService equipmentProductInstanceService;

    @GetMapping
    public ResponseEntity<List<EquipmentProduct>> getEquipmentProductsWithActiveInstances(){
        List<EquipmentProduct> equipmentProductList = equipmentProductService.getActiveEquipmentProductsWithActiveInstances();
        return new ResponseEntity<>(equipmentProductList, equipmentProductList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{equipmentProductId}")
    public ResponseEntity<EquipmentProduct> getEquipmentProductById(@PathVariable Long equipmentProductId){
        EquipmentProduct equipmentProduct = equipmentProductService.getEquipmentProductById(equipmentProductId);
        return new ResponseEntity<>(equipmentProduct, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<EquipmentProduct> createEquipmentProduct(@RequestBody EquipmentProductDTO equipmentProductDTO) {
        EquipmentProduct newEquipmentProduct = equipmentProductService.createEquipmentProduct(equipmentProductDTO);
        return new ResponseEntity<>(newEquipmentProduct, HttpStatus.OK);
    }

    @PutMapping("/{equipmentProductId}")
    public ResponseEntity<EquipmentProduct> updateProduct (@PathVariable Long equipmentProductId, @RequestBody EquipmentProductDTO equipmentProductDTO){
        EquipmentProduct updatedEquipmentProduct = equipmentProductService.updateEquipmentProduct(equipmentProductId, equipmentProductDTO);
        return new ResponseEntity<>(updatedEquipmentProduct, HttpStatus.OK);
    }

    @DeleteMapping("/{equipmentProductId}")
    public ResponseEntity<String> deleteEquipmentProduct(@PathVariable Long equipmentProductId){
        equipmentProductService.deleteEquipmentProductAndActiveInstances(equipmentProductId);
        return new ResponseEntity<>("EquipmentProduct successfully deleted.", HttpStatus.OK);
    }


    @GetMapping("/{equipmentProductId}/productList")
    public ResponseEntity<List<EquipmentProductInstance>> getEquipmentProductInstances(@PathVariable Long equipmentProductId) {
        List<EquipmentProductInstance> equipmentProductInstances = equipmentProductInstanceService.getEquipmentProductInstancesByEquipmentProductId(equipmentProductId);
        return new ResponseEntity<>(equipmentProductInstances, equipmentProductInstances.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }
}
