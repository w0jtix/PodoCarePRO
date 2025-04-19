package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand;

public class BrandDeletionException extends RuntimeException{
    public BrandDeletionException(String message) {
        super(message);
    }

    public BrandDeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}
