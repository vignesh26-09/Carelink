package com.learning.carelink.controller;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learning.carelink.dto.BookingRequestDto;
import com.learning.carelink.entity.Appointment;
import com.learning.carelink.security.AccountUserDetails;
import com.learning.carelink.service.AppointmentService;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> book(@AuthenticationPrincipal AccountUserDetails user,
            @Valid @RequestBody BookingRequestDto dto) {
              Appointment appointment = appointmentService.bookAppointment(user.getUsername(), dto);
        return ResponseEntity.ok(appointment);
    }
        @PutMapping("/cancel/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR')")
    public ResponseEntity<Void> cancel(
            @AuthenticationPrincipal AccountUserDetails user,
            @PathVariable Long id) {

        appointmentService.cancelAppointment(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

        @GetMapping("/my")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR')")
    public ResponseEntity<List<Appointment>> getMyAppointments(
            @AuthenticationPrincipal AccountUserDetails user) {

        List<Appointment> appointments =
                appointmentService.getPatientAppointments(user.getUsername());

        return ResponseEntity.ok(appointments);
    }
       @GetMapping
    @PreAuthorize("hasRole('CLINIC_ADMIN')")
    public ResponseEntity<List<Appointment>> getAllAppointments() {

        List<Appointment> appointments =
                appointmentService.getAllAppointments();

        return ResponseEntity.ok(appointments);
    }


}
