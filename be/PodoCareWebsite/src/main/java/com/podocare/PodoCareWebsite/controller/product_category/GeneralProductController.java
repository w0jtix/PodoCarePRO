package com.podocare.PodoCareWebsite.controller.product_category;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.ProductCreationDTO;
import com.podocare.PodoCareWebsite.model.order.OrderProductValidator;
import com.podocare.PodoCareWebsite.model.product.product_category.ProductFilterDTO;
import com.podocare.PodoCareWebsite.service.product_category.AllProductsService;
import com.podocare.PodoCareWebsite.service.product_category.EquipmentProductService;
import com.podocare.PodoCareWebsite.service.product_category.SaleProductService;
import com.podocare.PodoCareWebsite.service.product_category.ToolProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.web.JsonPath;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/products")
public class GeneralProductController {

    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    private EquipmentProductService equipmentProductService;
    @Autowired
    private AllProductsService allProductsService;

    @GetMapping
    public ResponseEntity<List<Object>> getAllProducts() {
        List<Object> productsList = allProductsService.getAllProducts();
        return new ResponseEntity<>(productsList, productsList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{productId}/find")
    public ResponseEntity<Object> findProductById(@PathVariable Long productId) {
        Object product = allProductsService.getProductById(productId);
        return new ResponseEntity<>(product, product != null ? HttpStatus.OK : HttpStatus.NOT_FOUND);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Object> findProductByIdAndIncludeActiveInstancesList(@PathVariable Long productId) {
        Object productDTO = allProductsService.getProductByIdAndIncludeActiveInstances((productId));
        return new ResponseEntity<>(productDTO, productDTO != null ? HttpStatus.OK : HttpStatus.NOT_FOUND);
    }

    @PostMapping("/filterAll")
    public ResponseEntity<List<Object>> getFilteredProducts(@RequestBody ProductFilterDTO productFilterDTO) {
        List<Object> matchingProducts = allProductsService.getFilteredProducts(productFilterDTO);
        return new ResponseEntity<>(matchingProducts, HttpStatus.OK);
    }

    /*@PostMapping("/validate")
    public ResponseEntity<OrderProductValidator> validateProducts(@RequestBody List<OrderProductDTO> orderProductDTOList) {
        OrderProductValidator validator = allProductsService.validateProducts(orderProductDTOList);
        return new ResponseEntity<>(validator, HttpStatus.OK);
    }*/

    @PostMapping("/createNewProducts")
    public ResponseEntity<List<Object>> createNewProducts(@RequestBody List<ProductCreationDTO> productsToCreateList) {
        List<Object> createdProducts = allProductsService.createProducts(productsToCreateList);
        return  new ResponseEntity<>(createdProducts, HttpStatus.CREATED);
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<Object> updateProduct(@PathVariable Long productId, @RequestBody ProductCreationDTO productCreationDTO) {
        Object updatedProducts = allProductsService.updateProduct(productId, productCreationDTO);
        return new ResponseEntity<>(updatedProducts, HttpStatus.OK);
    }

    @PostMapping("/filter")
    public ResponseEntity<List<Object>> getFilteredProductsWithActiveInstances(@RequestBody ProductFilterDTO productFilterDTO) {
        List<Object> allFilteredProductsList = allProductsService.getFilteredProductsWithActiveInstances(productFilterDTO);
        return new ResponseEntity<>(allFilteredProductsList, allFilteredProductsList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
        allProductsService.deleteProductById(productId);
        return new ResponseEntity<>("Product successfully deleted.", HttpStatus.OK);
    }

}
