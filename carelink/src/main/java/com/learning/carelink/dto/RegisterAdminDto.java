package com.learning.carelink.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterAdminDto {
    @NotBlank(message="Email is needed")
    @Email
    private String emaill;
    @NotBlank(message="Password is required")
    private String password;
}
