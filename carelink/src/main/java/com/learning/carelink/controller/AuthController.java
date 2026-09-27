package com.learning.carelink.controller;
import com.learning.carelink.dto.AuthResponseDto;
import com.learning.carelink.dto.RegisterPatientDto;
import com.learning.carelink.service.AuthService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import com.learning.carelink.dto.LoginRequestDto;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final com.learning.carelink.repository.PatientProfileRepository patients;
    private final com.learning.carelink.repository.DoctorProfileRepository doctors;

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public java.util.Map<String, Object> me(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.learning.carelink.security.AccountUserDetails user) {
        var profile = new java.util.LinkedHashMap<String,Object>();
        profile.put("email", user.getUsername());
        profile.put("role", user.getAccount().getRole());
        profile.put("fullName", "Clinic administrator");
        patients.findByAccountId(user.getAccount().getId()).ifPresent(patient -> {
            profile.put("fullName", patient.getFullName());
            profile.put("bloodGroup", patient.getBloodGroup());
            profile.put("emergencyContact", patient.getEmergencyContact());
        });
        doctors.findByAccountId(user.getAccount().getId()).ifPresent(doctor -> {
            profile.put("fullName", doctor.getFullName() == null ? "Doctor" : doctor.getFullName());
            profile.put("specialization", doctor.getSpecialization());
            profile.put("consultationFee", doctor.getConsultationFee());
            profile.put("yearsOfExperience", doctor.getYearsOfExperience());
        });
        return profile;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register_Patient(@Valid @RequestBody RegisterPatientDto dto) {
         return  ResponseEntity.ok(authService.registerPatient(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
    
    
}
