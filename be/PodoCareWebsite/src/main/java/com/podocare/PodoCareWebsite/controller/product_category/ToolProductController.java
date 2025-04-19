package com.podocare.PodoCareWebsite.controller.product_category;

import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.ToolProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.service.product_category.ToolProductService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/products/toolProducts")
public class ToolProductController{
    private final ToolProductService toolProductService;
    private final ToolProductInstanceService toolProductInstanceService;

    @GetMapping
    public ResponseEntity<List<ToolProduct>> getToolProductsWithActiveInstances(){
        List<ToolProduct> toolProductList = toolProductService.getActiveToolProductsWithActiveInstances();
        return new ResponseEntity<>(toolProductList, toolProductList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{toolProductId}")
    public ResponseEntity<ToolProduct> getToolProductById(@PathVariable Long toolProductId){
        ToolProduct toolProduct = toolProductService.getToolProductById(toolProductId);
        return new ResponseEntity<>(toolProduct, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<ToolProduct> createToolProduct(@RequestBody ToolProductDTO toolProductDTO) {
        ToolProduct newToolProduct = toolProductService.createToolProduct(toolProductDTO);
        return new ResponseEntity<>(newToolProduct, HttpStatus.OK);
    }

    @PutMapping("/{toolProductId}")
    public ResponseEntity<ToolProduct> updateProduct (@PathVariable Long toolProductId, @RequestBody ToolProductDTO toolProductDTO){
        ToolProduct updatedToolProduct = toolProductService.updateToolProduct(toolProductId, toolProductDTO);
        return new ResponseEntity<>(updatedToolProduct, HttpStatus.OK);
    }

    @DeleteMapping("/{toolProductId}")
    public ResponseEntity<String> deleteToolProduct(@PathVariable Long toolProductId){
        toolProductService.deleteToolProductAndActiveInstances(toolProductId);
        return new ResponseEntity<>("ToolProduct successfully deleted.", HttpStatus.OK);
    }


    @GetMapping("/{toolProductId}/productList")
    public ResponseEntity<List<ToolProductInstance>> getToolProductInstances(@PathVariable Long toolProductId) {
        List<ToolProductInstance> toolProductInstances = toolProductInstanceService.getToolProductInstancesByToolProductId(toolProductId);
        return new ResponseEntity<>(toolProductInstances, toolProductInstances.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }
}
