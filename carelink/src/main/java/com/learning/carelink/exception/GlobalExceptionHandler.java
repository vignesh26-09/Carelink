package com.learning.carelink.exception;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String , String>> handleResourceNotException(ResourceNotFoundException ex){
              Map<String , String > response = new HashMap<>();
              response.put("error",ex.getMessage());
              return new ResponseEntity<>(response , HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(AppointmentLimitExceededException.class)
    public ResponseEntity<Map<String , String>> handleAppointmentLimitExceededException( AppointmentLimitExceededException ex){
              Map<String , String > response = new HashMap<>();
              response.put("error",ex.getMessage());
              return new ResponseEntity<>(response , HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String , String>> handleRuntimeException(RuntimeException ex){
              Map<String , String > response = new HashMap<>();
              response.put("error",ex.getMessage());
              return new ResponseEntity<>(response , HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    

}
