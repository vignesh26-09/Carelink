package com.learning.carelink.dto;
import com.learning.carelink.enums.Role;

import lombok.*;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDto {
    private String token;
    private String email;
    private Role role;
}
