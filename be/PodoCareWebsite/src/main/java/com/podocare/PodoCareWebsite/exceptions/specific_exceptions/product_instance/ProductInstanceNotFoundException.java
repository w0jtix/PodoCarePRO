package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance;

public class ProductInstanceNotFoundException extends RuntimeException{
    public ProductInstanceNotFoundException(String message) {
        super(message);
    }
    public ProductInstanceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
