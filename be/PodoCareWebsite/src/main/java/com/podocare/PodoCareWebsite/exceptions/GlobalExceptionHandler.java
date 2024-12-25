package com.podocare.PodoCareWebsite.exceptions;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.*;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductUpdateException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceUpdateException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // BRAND & SUPPLIER

    @ExceptionHandler(BrandDeleteRestrictionException.class)
    public ResponseEntity<String> handleBrandDeleteRestrictionException(BrandDeleteRestrictionException ex) {
        log.error("Existing product has this Brand as an attribute: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(SupplierDeleteRestrictionException.class)
    public ResponseEntity<String> handleSupplierDeleteRestrictionException(SupplierDeleteRestrictionException ex) {
        log.error("Existing product instance has this Supplier as an attribute: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(BrandDeletionException.class)
    public ResponseEntity<String> handleBrandDeletionException(BrandDeletionException ex) {
        log.error("Brand deletion failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(BrandNotFoundException.class)
    public ResponseEntity<String> handleBrandNotFoundException(BrandNotFoundException ex) {
        log.error("Brand not found: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BrandCreationException.class)
    public ResponseEntity<String> handleBrandCreationException(BrandCreationException ex) {
        log.error("Brand creation failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(SupplierNotFoundException.class)
    public ResponseEntity<String> handleSupplierNotFoundException(SupplierNotFoundException ex) {
        log.error("Supplier not found or failed to create: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(SupplierCreationException.class)
    public ResponseEntity<String> handleSupplierCreationException(SupplierCreationException ex) {
        log.error("Supplier creation failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
    @ExceptionHandler(SupplierDeletionException.class)
    public ResponseEntity<String> handleSupplierDeletionException(SupplierDeletionException ex) {
        log.error("Supplier deletion failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }


    // PRODUCT

    @ExceptionHandler(ProductCreationException.class)
    public ResponseEntity<String> handleProductCreationException(ProductCreationException ex) {
        log.error("Product creation failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ProductUpdateException.class)
    public ResponseEntity<String> handleProductUpdateException(ProductUpdateException ex) {
        log.error("Product update failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<String> handleProductNotFoundException(ProductNotFoundException ex) {
        log.error("Product not found: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ProductDeletionException.class)
    public ResponseEntity<String> handleProductDeletionException(ProductDeletionException ex) {
        log.error("Product deletion failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }



    // PRODUCT INSTANCE

    @ExceptionHandler(ProductInstanceCreationException.class)
    public ResponseEntity<String> handleProductInstanceCreationException(ProductInstanceCreationException ex) {
        log.error("Product instance creation failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ProductInstanceUpdateException.class)
    public ResponseEntity<String> handleProductInstanceUpdateException(ProductInstanceUpdateException ex) {
        log.error("Product instance update failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ProductInstanceNotFoundException.class)
    public ResponseEntity<String> handleProductInstanceNotFoundException(ProductInstanceNotFoundException ex) {
        log.error("Product instance not found: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ProductInstanceDeletionException.class)
    public ResponseEntity<String> handleProductInstanceDeletionException(ProductInstanceDeletionException ex) {
        log.error("Product instance deletion failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ORDER

    @ExceptionHandler(OrderCreationException.class)
    public ResponseEntity<String> handleOrderCreationException(OrderCreationException ex) {
        log.error("Order creation failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<String> handleOrderNotFoundException(OrderNotFoundException ex) {
        log.error("Order not found: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidOrderStateException.class)
    public ResponseEntity<String> handleInvalidOrderStateException(InvalidOrderStateException ex) {
        log.error("Invalid order state: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(OrderUpdateException.class)
    public ResponseEntity<String> handleOrderUpdateException(OrderUpdateException ex) {
        log.error("Order update failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(OrderDeletionException.class)
    public ResponseEntity<String> handleOrderDeletionException(OrderDeletionException ex) {
        if (ex.getCause() instanceof EmptyResultDataAccessException) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
        } else if (ex.getCause() instanceof DataIntegrityViolationException) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
        } else {
            log.error("Order deletion failed: {}", ex.getMessage());
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }




    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception ex) {
        return new ResponseEntity<>("An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
