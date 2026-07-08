package com.learning.carelink.controller;

import com.learning.carelink.security.AccountUserDetails;
import com.learning.carelink.service.ConsultationService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    // ==========================================================
    // APPROVE APPOINTMENT
    // POST /api/consultations/{id}/approve
    // ==========================================================
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> approveAppointment(@AuthenticationPrincipal AccountUserDetails user,
            @PathVariable Long id) {

        consultationService.approveAppointment(user.getUsername(),id);
        return ResponseEntity.ok().build();
    }

    // ==========================================================
    // START CONSULTATION
    // POST /api/consultations/{id}/start
    // ==========================================================
    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> startConsultation(@AuthenticationPrincipal AccountUserDetails user,
            @PathVariable Long id) {

        consultationService.startConsultation(user.getUsername(),id);
        return ResponseEntity.ok().build();
    }

    // ==========================================================
    // FINALIZE CONSULTATION
    // POST /api/consultations/{id}/finalize
    // ==========================================================
    @PostMapping("/{id}/finalize")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> finalizeConsultation(@AuthenticationPrincipal AccountUserDetails user,
            @PathVariable Long id,
            @RequestParam String diagnosis,
            @RequestParam String medicationsJson) {

        consultationService.finalizeConsultation(user.getUsername(),
                id,
                diagnosis,
                medicationsJson
        );

        return ResponseEntity.ok().build();
    }
}