package com.learning.carelink.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
@Setter
@Getter 
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDto {
    @NotNull(message ="slot is required")
    private Long slotId;
    @NotBlank(message =" Reason for visit")
    private String reasonForVisit;
}
