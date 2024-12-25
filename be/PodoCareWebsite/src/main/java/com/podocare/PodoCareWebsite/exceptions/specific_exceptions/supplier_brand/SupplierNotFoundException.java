package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand;

public class SupplierNotFoundException extends RuntimeException{
    public SupplierNotFoundException(String message) {
        super(message);
    }
    public SupplierNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
