package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getProducts(@RequestBody(required = false) FilterDTO filterDTO) {
        List<ProductDTO> productList = productService.getProducts(filterDTO);
        return new ResponseEntity<>(productList, productList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long productId) {
        ProductDTO product = productService.getProductById(productId);
        return new ResponseEntity<>(product, product != null ? HttpStatus.OK : HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<List<ProductDTO>> createNewProducts(@RequestBody List<ProductDTO> productsToCreate) {
        List<ProductDTO> createdProducts = productService.createProducts(productsToCreate);
        return  new ResponseEntity<>(createdProducts, HttpStatus.CREATED);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long productId, @RequestBody ProductDTO updatedProduct) {
        ProductDTO products = productService.updateProduct(productId, updatedProduct);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProductById(productId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
