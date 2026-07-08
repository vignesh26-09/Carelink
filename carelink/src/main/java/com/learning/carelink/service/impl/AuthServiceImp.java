package com.learning.carelink.service.impl;

import com.learning.carelink.dto.LoginRequestDto;
import com.learning.carelink.entity.PatientProfile;
import com.learning.carelink.repository.AccountRepository;
import com.learning.carelink.repository.PatientProfileRepository;
import com.learning.carelink.security.AccountUserDetails;
import com.learning.carelink.security.JwtService;
import com.learning.carelink.dto.AuthResponseDto;
import com.learning.carelink.dto.RegisterPatientDto;
import com.learning.carelink.entity.Account;
import com.learning.carelink.entity.enums.Role;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.learning.carelink.service.AuthService;
import jakarta.transaction.Transactional;
import lombok.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImp implements AuthService {
     private final AccountRepository accountRepository;
     private final PatientProfileRepository patientprofileRepo;
     private final AuthenticationManager authenticationManager;
     private final JwtService jwtService;
     private final PasswordEncoder passwordEncoder;

     @Override
     @Transactional
     public AuthResponseDto registerPatient(RegisterPatientDto dto) {
          if (accountRepository.existsByEmail(dto.getEmail())) {
               throw new RuntimeException("Account already exist");
          }

          Account account = accountRepository.save(
                    Account.builder()
                              .email(dto.getEmail())
                              .password(passwordEncoder.encode(dto.getPassword()))
                              .role(Role.PATIENT)
                              .build());
          PatientProfile patientProfile = patientprofileRepo.save(
                    PatientProfile.builder()
                              .account(account)
                              .fullName(dto.getFullName())
                              .bloodGroup(dto.getBloodGroup())
                              .emergencyContact(dto.getEmergencyContact())
                              .build());
          patientprofileRepo.save(patientProfile);
          String token = jwtService.generateToken(new AccountUserDetails(account));

          AuthResponseDto response = AuthResponseDto.builder()
                    .token(token)
                    .email(account.getEmail())
                    .role(account.getRole())
                    .build();

          return response;

     }

     @Override
     public AuthResponseDto login(LoginRequestDto dto) {
          authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));
          Account account = accountRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new RuntimeException("Account not found."));

          String token = jwtService.generateToken(new AccountUserDetails(account));

          AuthResponseDto response = new AuthResponseDto();
          response.setToken(token);
          response.setEmail(account.getEmail());
          response.setRole(account.getRole());
          return response;
     }

}
