package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance;

public class ProductInstanceDeletionException extends RuntimeException{
    public ProductInstanceDeletionException(String message) {
        super(message);
    }
    public ProductInstanceDeletionException(String message, Throwable cause) {
        super(message,cause);
    }
}
