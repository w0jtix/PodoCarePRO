package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order;

public class OrderNotFoundException extends RuntimeException{
    public OrderNotFoundException(String message) {
        super(message);
    }
    public OrderNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
