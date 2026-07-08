package com.learning.carelink.dto;
import jakarta.validation.constraints.*;
import lombok.*;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor

public class RegisterPatientDto {
    @Email
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Blood group is required")
    private String bloodGroup;

    @NotBlank(message = "Emergency contact is required")
    private String emergencyContact;
    
}
