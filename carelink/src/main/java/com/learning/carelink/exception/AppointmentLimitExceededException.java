package com.learning.carelink.exception;


public class AppointmentLimitExceededException extends RuntimeException {
   public AppointmentLimitExceededException(String message){
    super(message);
   }    
}
