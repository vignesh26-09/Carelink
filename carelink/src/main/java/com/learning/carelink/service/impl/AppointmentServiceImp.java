package com.learning.carelink.service.impl;
import com.learning.carelink.service.AppointmentService;
import com.learning.carelink.exception.ResourceNotFoundException;
import com.learning.carelink.entity.PatientProfile;
import com.learning.carelink.enums.AppointmentStatus;
import com.learning.carelink.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import com.learning.carelink.repository.AccountRepository;
import com.learning.carelink.repository.PatientProfileRepository;
import com.learning.carelink.entity.Account;
import com.learning.carelink.entity.Appointment;
import com.learning.carelink.dto.BookingRequestDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.learning.carelink.exception.AppointmentLimitExceededException;
import com.learning.carelink.entity.AvailabilitySlot;
import com.learning.carelink.repository.AvailabilitySlotRepository;
import com.learning.carelink.entity.DoctorProfile;
import com.learning.carelink.repository.DoctorProfileRepository;
import java.util.List;
@Service
@RequiredArgsConstructor

public class AppointmentServiceImp  implements AppointmentService {
    private final AccountRepository accountRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final AvailabilitySlotRepository availabilitySlotRepository;
    @Override
    @Transactional
    public  Appointment bookAppointment(String email , BookingRequestDto dto){
       Account account =  accountRepository.findByEmail(email)
       .orElseThrow(()->new ResourceNotFoundException("Account not found"));

       PatientProfile patient = patientProfileRepository.findByAccountId(account.getId()).orElseThrow(()-> new ResourceNotFoundException("Patient not found"));
       long pendingCount = appointmentRepository.countByPatientIdAndStatus(patient.getId(), AppointmentStatus.PENDING);
       if(pendingCount >=3){
        throw new AppointmentLimitExceededException("Maximum of 3 pending appointments allowed.");
       }
       AvailabilitySlot slot = availabilitySlotRepository.findById(dto.getSlotId())
       .orElseThrow(()-> new ResourceNotFoundException("Slot not found"));
        if(slot.isBooked()){
            throw new RuntimeException("Slot is already booked");
        }
        DoctorProfile doctor = slot.getDoctor();
        Appointment appointment = Appointment.builder()
        .patient(patient)
        .doctor(doctor)
        .slot(slot)
        .reasonForVisit(dto.getReasonForVisit())
        .status(AppointmentStatus.PENDING)
        .build();

        slot.setBooked(true);
        availabilitySlotRepository.save(slot);
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public void cancelAppointment(String email, Long appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));
 
        String patientEmail = appointment.getPatient().getAccount().getEmail();
        String doctorEmail = appointment.getDoctor().getAccount().getEmail();

        if (!patientEmail.equalsIgnoreCase(email) && !doctorEmail.equalsIgnoreCase(email)) {
            throw new RuntimeException("Unauthorized: You do not have permission to cancel this appointment.");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Completed appointment cannot be cancelled.");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment already cancelled.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        AvailabilitySlot slot = appointment.getSlot();
        slot.setBooked(false);
        availabilitySlotRepository.save(slot);

        appointmentRepository.save(appointment);
    }

    
    @Override
    public List<Appointment> getPatientAppointments(String email) {

        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found."));

        if (account.getRole().name().equals("PATIENT")) {
            PatientProfile patient = patientProfileRepository.findByAccountId(account.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
            return appointmentRepository.findByPatientId(patient.getId());
        }

        if (account.getRole().name().equals("DOCTOR")) {
            DoctorProfile doctor = doctorProfileRepository.findByAccountId(account.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found."));
            return appointmentRepository.findByDoctorId(doctor.getId());
        }

        throw new RuntimeException("Unsupported account role.");
    }
      @Override
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
