package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.request.ProductFilterDTO;
import com.podocare.PodoCareWebsite.service.ProductService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestBody ProductFilterDTO filter) {
        List<ProductDTO> productList = productService.getProducts(filter);
        return new ResponseEntity<>(productList, productList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ProductDTO> getProductById(@PathVariable(value = "id") Long id) {
        ProductDTO product = productService.getProductById(id);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ProductDTO> createProduct(@NonNull @RequestBody ProductDTO product) {
        ProductDTO createdProduct = productService.createProduct(product);
        return  new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PostMapping("/batch")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<ProductDTO>> createProducts(@NonNull @RequestBody List<ProductDTO> products) {
        List<ProductDTO> createdProducts = productService.createProducts(products);
        return  new ResponseEntity<>(createdProducts, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable(value = "id") Long id, @NonNull @RequestBody ProductDTO product) {
        ProductDTO saved = productService.updateProduct(id, product);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteProduct(@PathVariable(value = "id") Long id) {
        productService.deleteProductById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
