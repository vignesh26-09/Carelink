package com.learning.carelink.service;
import com.learning.carelink.dto.AuthResponseDto;
import com.learning.carelink.dto.LoginRequestDto;
import com.learning.carelink.dto.RegisterPatientDto;
public interface AuthService {
    AuthResponseDto registerPatient(RegisterPatientDto dto);
    AuthResponseDto login(LoginRequestDto dto);
}
