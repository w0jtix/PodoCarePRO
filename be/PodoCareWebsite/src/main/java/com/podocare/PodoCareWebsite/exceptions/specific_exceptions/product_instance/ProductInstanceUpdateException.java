package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance;

public class ProductInstanceUpdateException extends RuntimeException{
    public ProductInstanceUpdateException (String message){
        super(message);
    }
    public ProductInstanceUpdateException (String message, Throwable cause){
        super(message, cause);
    }
}
