package com.podocare.PodoCareWebsite.exceptions;

public class DeletionException extends RuntimeException{
    public DeletionException(String message) {
        super(message);
    }
    public DeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}
