package com.learning.carelink.controller;

import com.learning.carelink.dto.*;
import com.learning.carelink.entity.*;
import com.learning.carelink.enums.*;
import com.learning.carelink.repository.*;
import com.learning.carelink.service.CarePlanService;
import com.learning.carelink.security.AccountUserDetails;
import com.learning.carelink.exception.ResourceNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.util.*;
import java.math.BigDecimal;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class CareWorkflowController {
    private final CarePlanService plans;
    private final AccountRepository accounts;
    private final DoctorProfileRepository doctors;
    private final AppointmentRepository appointments;
    private final AvailabilitySlotRepository slots;
    private final PasswordEncoder passwords;
    @org.springframework.beans.factory.annotation.Value("${carelink.payments.demo-enabled:false}") private boolean demoEnabled;

    @PostMapping("/consultations/{id}/care-plan") @PreAuthorize("hasRole('DOCTOR')")
    public CareInvoice complete(@AuthenticationPrincipal AccountUserDetails user, @PathVariable Long id, @Valid @RequestBody CarePlanDto dto) {
        return plans.complete(user.getUsername(), id, dto);
    }
    @PostMapping("/appointments/{id}/accept") @PreAuthorize("hasRole('PATIENT')")
    public CareInvoice accept(@AuthenticationPrincipal AccountUserDetails user, @PathVariable Long id) {
        return plans.accept(user.getUsername(), id);
    }
    @PostMapping("/appointments/{id}/demo-pay") @PreAuthorize("hasRole('PATIENT')")
    public CareInvoice pay(@AuthenticationPrincipal AccountUserDetails user, @PathVariable Long id) {
        return plans.demoPay(user.getUsername(), id);
    }
    @DeleteMapping("/schedule/slots/{id}") @PreAuthorize("hasRole('DOCTOR')") @Transactional
    public void removeSlot(@AuthenticationPrincipal AccountUserDetails user, @PathVariable Long id) {
        AvailabilitySlot slot = slots.findByIdForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Slot not found."));
        if (!slot.getDoctor().getAccount().getEmail().equals(user.getUsername())) throw new AccessDeniedException("Not your slot.");
        if (slot.isBooked()) throw new IllegalArgumentException("Cancel the appointment before removing its slot.");
        if (!slot.getStartTime().isAfter(java.time.LocalDateTime.now())) throw new IllegalArgumentException("Past slots are retained as history.");
        slot.setWithdrawn(true);
    }
    @PostMapping("/doctors") @PreAuthorize("hasRole('CLINIC_ADMIN')") @Transactional
    public DoctorProfile addDoctor(@Valid @RequestBody RegisterDoctorDto dto) {
        String email = dto.getEmail().strip().toLowerCase(Locale.ROOT);
        if (accounts.existsByEmail(email)) throw new IllegalArgumentException("An account with this email already exists.");
        Account account = accounts.save(Account.builder().email(email).password(passwords.encode(dto.getPassword())).role(Role.DOCTOR).build());
        return doctors.save(DoctorProfile.builder().account(account).fullName(dto.getFullName().strip())
            .specialization(dto.getSpecialization().strip()).consultationFee(dto.getConsultationFee())
            .yearsOfExperience(dto.getYearsOfExperience()).build());
    }
    @GetMapping("/dashboard")
    public Map<String,Object> dashboard(@AuthenticationPrincipal AccountUserDetails user) {
        List<Appointment> visits = switch (user.getAccount().getRole()) {
            case CLINIC_ADMIN -> appointments.findAll();
            case DOCTOR -> appointments.findByDoctorId(doctors.findByAccountId(user.getAccount().getId()).orElseThrow().getId());
            case PATIENT -> appointments.findByPatientAccountId(user.getAccount().getId());
        };
        var completed = visits.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).toList();
        var billed = visits.stream().map(Appointment::getInvoice).filter(Objects::nonNull).toList();
        var paid = billed.stream().filter(i -> i.getStatus().equals("DEMO_PAID")).toList();
        Map<String,Object> result = new LinkedHashMap<>();
        result.put("completedVisits", completed.size());
        result.put("patientsConsulted", completed.stream().map(a -> a.getPatient().getId()).distinct().count());
        result.put("inQueue", visits.stream().filter(a -> a.getStatus()==AppointmentStatus.PENDING || a.getStatus()==AppointmentStatus.CONFIRMED).count());
        result.put("inProgress", visits.stream().filter(a -> a.getStatus()==AppointmentStatus.IN_PROGRESS).count());
        result.put("patientsReportedRecovered", completed.stream().filter(a -> a.getInvoice()!=null && a.getInvoice().getOutcome().equals("RECOVERED")).map(a -> a.getPatient().getId()).distinct().count());
        result.put("inPersonReferrals", billed.stream().filter(CareInvoice::isInPersonRequired).count());
        result.put("demoDoctorEarnings", paid.stream().map(CareInvoice::getDoctorFee).reduce(BigDecimal.ZERO,BigDecimal::add));
        result.put("demoMedicineRevenue", paid.stream().map(CareInvoice::getMedicineTotal).reduce(BigDecimal.ZERO,BigDecimal::add));
        result.put("demoGrossRevenue", paid.stream().map(CareInvoice::getTotal).reduce(BigDecimal.ZERO,BigDecimal::add));
        result.put("outstanding", billed.stream().filter(i -> !i.getStatus().equals("DEMO_PAID")).map(CareInvoice::getTotal).reduce(BigDecimal.ZERO,BigDecimal::add));
        result.put("demoPaymentsEnabled", demoEnabled);
        return result;
    }

    @GetMapping("/public/impact")
    public Map<String, Long> publicImpact() {
        long patientsConsulted = appointments.findAll().stream()
            .filter(appointment -> appointment.getStatus() == AppointmentStatus.COMPLETED)
            .map(appointment -> appointment.getPatient().getId())
            .distinct()
            .count();
        return Map.of("patientsConsulted", patientsConsulted);
    }
}
