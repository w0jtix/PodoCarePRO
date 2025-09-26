package com.podocare.PodoCareWebsite.exceptions;

public class InsufficientSupplyException  extends RuntimeException{
    public InsufficientSupplyException(String message) {
        super(message);
    }
    public InsufficientSupplyException(String message, Throwable cause) {
        super(message, cause);
    }
}
