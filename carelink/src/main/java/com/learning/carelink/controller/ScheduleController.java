package com.learning.carelink.controller;

import com.learning.carelink.entity.AvailabilitySlot;
import com.learning.carelink.security.AccountUserDetails;
import com.learning.carelink.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/slots")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> createSlot(
            @AuthenticationPrincipal AccountUserDetails user,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime start,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime end) {

        scheduleService.createSlot(user.getUsername(), start, end);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/slots/{doctorId}")
    public ResponseEntity<List<AvailabilitySlot>> getAvailableSlots(
            @PathVariable Long doctorId) {

        return ResponseEntity.ok(
                scheduleService.getAvailableSlots(doctorId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AvailabilitySlot>> getMySlots(
            @AuthenticationPrincipal AccountUserDetails user) {

        return ResponseEntity.ok(
                scheduleService.getDoctorSlots(user.getUsername()));
    }
}