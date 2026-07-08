package com.learning.carelink.service.impl;
import com.learning.carelink.repository.AppointmentRepository;
import com.learning.carelink.service.ConsultationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.carelink.entity.Account;
import com.learning.carelink.entity.Appointment;
import com.learning.carelink.entity.DoctorProfile;
import com.learning.carelink.entity.enums.AppointmentStatus;
import com.learning.carelink.exception.ResourceNotFoundException;
import com.learning.carelink.repository.AccountRepository;
import com.learning.carelink.repository.DoctorProfileRepository;
import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.Set;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class ConsultationServiceImp implements ConsultationService{
    private final AppointmentRepository appointmentRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AccountRepository accountRepository;
    private static final Set<String> PROHIBITED_MEDICAIONS =Set.of(
      "cyanide" ,"arsenic","mercury","ricin"
    );
    @Override
    @Transactional
    public void approveAppointment(String doctorEmail, Long appointmentId){
        Appointment appointment = getDoctorAppointment(doctorEmail, appointmentId);
        if(appointment.getStatus() !=AppointmentStatus.PENDING){
            throw new RuntimeException("Only pending appointments can be approved");

        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
    }
    
    @Override
    @Transactional
    public void startConsultation(String doctorEmail , Long appointmentId){
        Appointment appointment = getDoctorAppointment(doctorEmail,appointmentId);
        if(appointment.getStatus()!=AppointmentStatus.CONFIRMED){
            throw new RuntimeException("Appointment must be confirmed ");
        }
        appointment.setStatus(AppointmentStatus.IN_PROGRESS);
        appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public void finalizeConsultation (String doctorEmail , Long appointmentId, String diagnosis, String medicationJson){
     Appointment appointment = getDoctorAppointment(doctorEmail , appointmentId);
     if(appointment.getStatus() != AppointmentStatus.IN_PROGRESS){
        throw new RuntimeException("Consultaion is not in progress");
     }
     if (medicationJson == null || medicationJson.isBlank()){
        throw new RuntimeException("Medication list cannot be empty");
     }
        ObjectMapper mapper = new ObjectMapper();
        List<String> medications;
        try {
            medications = mapper.readValue(medicationJson, new TypeReference<List<String>>() {});
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse medication list", e);
        }

     for(String medication : medications){
       if(PROHIBITED_MEDICAIONS.contains(medication.trim().toLowerCase())){
            throw new RuntimeException("Prohibited medication detected:"+ medication);
        }
     }
     appointment.setMedications(String.join(",", medications));
    
    }
      private Appointment getDoctorAppointment(String doctorEmail, Long appointmentId) {
        Account account = accountRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor account not found."));

        DoctorProfile doctor = doctorProfileRepository.findByAccountId(account.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found."));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));

        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You are not authorized for this appointment.");
        }

        return appointment;
    }
}


