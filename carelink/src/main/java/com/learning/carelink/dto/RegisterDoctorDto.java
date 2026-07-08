package com.learning.carelink.dto;
import java.math.BigDecimal;

import jakarta.validation.constraints.*;

import lombok.*;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDoctorDto {
    @NotBlank(message = "Email is required")
    @Email
    private String email;

    @NotBlank(message="password is required")
    private String password;
    @NotBlank(message="Specialization is required")
    private String specialization;

    
    
    @NotNull(message = "Consultation fee is required")
    @Positive(message = "Fee must be positive")
    private BigDecimal consultationFee;

    @NotNull(message = "Years of experience required")
    @PositiveOrZero
    private Integer yearsOfExperience;


}
