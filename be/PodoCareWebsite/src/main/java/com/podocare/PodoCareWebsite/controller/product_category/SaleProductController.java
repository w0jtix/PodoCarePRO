package com.podocare.PodoCareWebsite.controller.product_category;

import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.SaleProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.service.product_category.SaleProductService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.SaleProductInstanceService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/products/saleProducts")
public class SaleProductController{
    private final SaleProductService saleProductService;
    private final SaleProductInstanceService saleProductInstanceService;

    @GetMapping
    public ResponseEntity<List<SaleProduct>> getSaleProductsWithActiveInstances(){

        List<SaleProduct> saleProductList = saleProductService.getActiveSaleProductsWithActiveInstances();
        return new ResponseEntity<>(saleProductList, saleProductList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{saleProductId}")
    public ResponseEntity<SaleProduct> getSaleProductById(@PathVariable Long saleProductId){
        SaleProduct saleProduct = saleProductService.getSaleProductById(saleProductId);
        return new ResponseEntity<>(saleProduct, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<SaleProduct> createSaleProduct(@RequestBody SaleProductDTO saleProductDTO) {
        SaleProduct newSaleProduct = saleProductService.createSaleProduct(saleProductDTO);
        return new ResponseEntity<>(newSaleProduct, HttpStatus.OK);
    }

    @PutMapping("/{saleProductId}")
    public ResponseEntity<SaleProduct> updateProduct (@PathVariable Long saleProductId, @RequestBody SaleProductDTO saleProductDTO){
        SaleProduct updatedSaleProduct = saleProductService.updateSaleProduct(saleProductId, saleProductDTO);
        return new ResponseEntity<>(updatedSaleProduct, HttpStatus.OK);
    }

    @DeleteMapping("/{saleProductId}")
    public ResponseEntity<String> deleteSaleProduct(@PathVariable Long saleProductId){
        saleProductService.deleteSaleProductAndActiveInstances(saleProductId);
        return new ResponseEntity<>("SaleProduct successfully deleted.", HttpStatus.OK);
    }


    @GetMapping("/{saleProductId}/productList")
    public ResponseEntity<List<SaleProductInstance>> getSaleProductInstances(@PathVariable Long saleProductId) {
        List<SaleProductInstance> saleProductInstances = saleProductInstanceService.getSaleProductInstancesBySaleProductId(saleProductId);
        return new ResponseEntity<>(saleProductInstances, saleProductInstances.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }
}
