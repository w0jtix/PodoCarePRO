package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product;

public class ProductCreationException extends RuntimeException{
    public ProductCreationException(String message) {
        super(message);
    }
    public ProductCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
