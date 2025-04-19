package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product;

public class ProductNotFoundException extends  RuntimeException{
    public ProductNotFoundException(String message) {
        super(message);
    }
    public ProductNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
