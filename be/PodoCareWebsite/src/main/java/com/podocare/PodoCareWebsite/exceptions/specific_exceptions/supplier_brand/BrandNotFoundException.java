package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand;

public class BrandNotFoundException extends RuntimeException{
    public BrandNotFoundException(String message) {
        super(message);
    }
    public BrandNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
