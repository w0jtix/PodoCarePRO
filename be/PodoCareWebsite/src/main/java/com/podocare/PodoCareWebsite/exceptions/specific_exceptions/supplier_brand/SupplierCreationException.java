package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.supplier_brand;

public class SupplierCreationException extends RuntimeException{
    public SupplierCreationException(String message) {
        super(message);
    }
    public SupplierCreationException(String message, Throwable cause) {
        super(message,cause);
    }
}
