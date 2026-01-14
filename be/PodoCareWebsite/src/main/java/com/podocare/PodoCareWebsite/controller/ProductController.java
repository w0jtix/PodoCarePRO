package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.request.ProductFilterDTO;
import com.podocare.PodoCareWebsite.service.ProductPdfService;
import com.podocare.PodoCareWebsite.service.ProductService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ProductPdfService productPdfService;

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @RequestBody ProductFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        Page<ProductDTO> productPage = productService.getProducts(filter, page, size);
        return new ResponseEntity<>(productPage, productPage.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
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


    @PostMapping("/inventory-report")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<byte[]> generateInventoryReport(@RequestBody(required = false) ProductFilterDTO filter) {

        byte[] pdfContent = productPdfService.generateInventoryReport(filter);

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_PDF);

        String filename = "PodoCare-stan-magazynowy-" +
                LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")) + ".pdf";
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build());

        headers.setContentLength(pdfContent.length);

        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }
}
