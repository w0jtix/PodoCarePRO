package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.DTO.ProductDisplayDTO;
import com.podocare.PodoCareWebsite.DTO.ProductRequestDTO;
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

    @PostMapping("/get")
    public ResponseEntity<List<ProductDisplayDTO>> getProducts(@RequestBody FilterDTO filterDTO) {
        List<ProductDisplayDTO> productList = productService.getProducts(filterDTO);
        return new ResponseEntity<>(productList, productList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDisplayDTO> getProductById(@PathVariable Long productId) {
        ProductDisplayDTO product = productService.getProductDisplayById(productId);
        return new ResponseEntity<>(product, product != null ? HttpStatus.OK : HttpStatus.NOT_FOUND);
    }

    @PostMapping("/create")
    public ResponseEntity<ProductDisplayDTO> createNewProduct(@RequestBody ProductRequestDTO productToCreate) {
        ProductDisplayDTO createdProduct = productService.createProduct(productToCreate);
        return  new ResponseEntity<>(createdProduct, HttpStatus.CREATED);
    }

    @PostMapping("/create/batch")
    public ResponseEntity<List<ProductDisplayDTO>> createNewProducts(@RequestBody List<ProductRequestDTO> productsToCreate) {
        List<ProductDisplayDTO> createdProducts = productService.createProducts(productsToCreate);
        return  new ResponseEntity<>(createdProducts, HttpStatus.CREATED);
    }



    @PutMapping("/{productId}")
    public ResponseEntity<ProductDisplayDTO> updateProduct(@PathVariable Long productId, @RequestBody ProductRequestDTO updatedProduct) {
        ProductDisplayDTO products = productService.updateProduct(productId, updatedProduct);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long productId) {
        productService.deleteProductById(productId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
