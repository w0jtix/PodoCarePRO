package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand;

public class BrandCreationException extends RuntimeException{
    public BrandCreationException(String message) {
        super(message);
    }
    public BrandCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
