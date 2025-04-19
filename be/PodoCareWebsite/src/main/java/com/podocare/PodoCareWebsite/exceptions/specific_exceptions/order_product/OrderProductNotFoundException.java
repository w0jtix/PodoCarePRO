package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order_product;


public class OrderProductNotFoundException extends RuntimeException{
    public OrderProductNotFoundException(String message) {
        super(message);
    }
    public OrderProductNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
