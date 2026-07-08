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

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register_Patient(@Valid @RequestBody RegisterPatientDto dto) {
         return  ResponseEntity.ok(authService.registerPatient(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
    
    
}
