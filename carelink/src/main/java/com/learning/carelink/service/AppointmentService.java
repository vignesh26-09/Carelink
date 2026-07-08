package com.learning.carelink.service;

import com.learning.carelink.dto.BookingRequestDto;
import com.learning.carelink.entity.Appointment;
import java.util.List;
public interface AppointmentService {
    Appointment bookAppointment(String email , BookingRequestDto dto );
    void cancelAppointment(String email,  Long appointmentId );
    List<Appointment> getPatientAppointments(String email);
    List<Appointment>getAllAppointments();
}