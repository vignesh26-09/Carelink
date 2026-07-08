package com.learning.carelink.service.impl;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import com.learning.carelink.entity.Account;
import com.learning.carelink.entity.AvailabilitySlot;
import com.learning.carelink.repository.*;
import com.learning.carelink.service.ScheduleService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.learning.carelink.entity.DoctorProfile;
import com.learning.carelink.exception.ResourceNotFoundException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImp implements ScheduleService{
    private final AccountRepository accountRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    @Override
    @Transactional
    public void createSlot(String doctorEmail , LocalDateTime start ,LocalDateTime end){
        if(start.isAfter(end) || start.equals(end)){
            throw new IllegalArgumentException("Start time must be before end time");
        }
        Account account = accountRepository.findByEmail(doctorEmail).orElseThrow(()-> new ResourceNotFoundException("Account not found"));
        DoctorProfile doctor =doctorProfileRepository.findByAccountId(account.getId())
        .orElseThrow(()-> new ResourceNotFoundException("doctor not found"));
        if (availabilitySlotRepository.existsOverlapping(doctor.getId(), start, end)) {
            throw new RuntimeException("Overlapping slot already exists.");
        }

        AvailabilitySlot slot = AvailabilitySlot.builder()
                .doctor(doctor)
                .startTime(start)
                .endTime(end)
                .booked(false)
                .build();

        availabilitySlotRepository.save(slot);
    }
       @Override
    public List<AvailabilitySlot> getAvailableSlots(Long doctorId) {
        return availabilitySlotRepository.findByDoctorIdAndBookedFalse(doctorId);
    }

    @Override
    public List<AvailabilitySlot> getDoctorSlots(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor account not found."));

        DoctorProfile doctor = doctorProfileRepository.findByAccountId(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found."));

        return availabilitySlotRepository.findByDoctorId(doctor.getId());
    }
}
