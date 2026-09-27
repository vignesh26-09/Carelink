package com.learning.carelink.exception;

import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> notFound(ResourceNotFoundException ex) { return error(404, ex.getMessage()); }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> authentication(AuthenticationException ex) { return error(401, "Email or password is incorrect."); }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> forbidden(AccessDeniedException ex) { return error(403, "Your account cannot perform this action."); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validation(MethodArgumentNotValidException ex) {
        return error(400, ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage()).collect(java.util.stream.Collectors.joining("; ")));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> conflict(DataIntegrityViolationException ex) { return error(409, "This record already exists or is linked to appointment history."); }
    @ExceptionHandler({IllegalArgumentException.class, AppointmentLimitExceededException.class})
    public ResponseEntity<?> badRequest(RuntimeException ex) { return error(400, ex.getMessage()); }
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> unexpected(RuntimeException ex) { return error(500, "Something went wrong. Please try again."); }
    private ResponseEntity<?> error(int status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }
}
