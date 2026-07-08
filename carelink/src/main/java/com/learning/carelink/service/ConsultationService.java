package com.learning.carelink.service;

public interface ConsultationService {
    void approveAppointment(String doctorEmail , Long appointmentId);
    void startConsultation(String doctorEmail, Long appointmentId);
    void finalizeConsultation(String doctorEmail, Long appointmentId , String diagonsis , String medicationJson);


}
