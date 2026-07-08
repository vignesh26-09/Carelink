package com.learning.carelink.dto;
import lombok.*;
import java.time.LocalDateTime;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {
        private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private String reasonForVisit;

}
