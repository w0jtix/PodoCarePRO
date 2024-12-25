package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance;

public class ProductInstanceCreationException extends RuntimeException{
    public ProductInstanceCreationException (String message){
        super(message);
    }
    public ProductInstanceCreationException (String message, Throwable cause){
        super(message, cause);
    }
}
