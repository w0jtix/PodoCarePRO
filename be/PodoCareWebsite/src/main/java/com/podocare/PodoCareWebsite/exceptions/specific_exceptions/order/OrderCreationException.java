package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order;

public class OrderCreationException extends RuntimeException{
    public OrderCreationException(String message) {
        super(message);
    }
    public OrderCreationException(String message, Throwable cause) {
        super(message,cause);
    }
}
