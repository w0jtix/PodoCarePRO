package com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order;

public class InvalidOrderStateException extends RuntimeException{
    public InvalidOrderStateException(String message) {
        super(message);
    }
    public InvalidOrderStateException(String message, Throwable cause) {
        super(message, cause);
    }
}
