package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order;

public class OrderUpdateException extends RuntimeException{
    public OrderUpdateException(String message, Throwable cause) {
        super(message,cause);
    }
}
