package com.learning.carelink.dto;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {
    @NotBlank(message ="Email is required")
    private String email;
    @NotBlank(message ="password is required")
    private String password;
}
