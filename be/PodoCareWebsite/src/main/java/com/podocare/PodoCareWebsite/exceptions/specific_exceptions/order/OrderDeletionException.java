package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order;

public class OrderDeletionException extends RuntimeException{
    public OrderDeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}
