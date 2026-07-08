package com.learning.carelink.service;
import com.learning.carelink.entity.AvailabilitySlot;
import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleService {

    void createSlot(String doctorEmail , LocalDateTime start , LocalDateTime end);
    List<AvailabilitySlot> getAvailableSlots(Long id);
    List<AvailabilitySlot> getDoctorSlots(String email);
}
    

