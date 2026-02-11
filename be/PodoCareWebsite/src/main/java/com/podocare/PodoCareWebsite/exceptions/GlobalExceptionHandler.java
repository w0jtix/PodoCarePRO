package com.podocare.PodoCareWebsite.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CreationException.class)
    public ResponseEntity<String> handleCreationException(CreationException ex) {
        log.error("Creation failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DeletionException.class)
    public ResponseEntity<String> handleDeletionException(DeletionException ex) {
        log.error("Deletion failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(UpdateException.class)
    public ResponseEntity<String> handleResourceUpdateException(UpdateException ex) {
        log.error("Resource update failed: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<String> handleConflictException(ConflictException ex) {
        log.error("Conflict: {}", ex.getMessage());
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AuditException.class)
    public ResponseEntity<String> handleAuditException(AuditException ex) {
        log.error("Audit failed: {}", ex.getMessage());
        return new ResponseEntity<>("Operation failed due to audit logging error.", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
