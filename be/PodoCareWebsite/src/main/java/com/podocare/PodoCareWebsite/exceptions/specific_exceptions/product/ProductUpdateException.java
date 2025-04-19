package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product;

public class ProductUpdateException extends RuntimeException{
    public ProductUpdateException(String message) {
        super(message);
    }
    public ProductUpdateException(String message, Throwable cause) {
        super(message, cause);
    }
}

