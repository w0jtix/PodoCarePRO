package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product;

public class ProductDeletionException extends RuntimeException{
    public ProductDeletionException(String message) {
        super(message);
    }
    public ProductDeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}
