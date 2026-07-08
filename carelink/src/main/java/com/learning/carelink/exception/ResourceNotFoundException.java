package com.learning.carelink.exception;
import java.lang.RuntimeException;
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message){
        super(message);
    }
}
