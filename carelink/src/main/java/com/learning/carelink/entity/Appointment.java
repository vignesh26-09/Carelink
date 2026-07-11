package com.learning.carelink.entity;
import com.learning.carelink.enums.AppointmentStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appointments")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many appointments can belong to one patient
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    // Many appointments can belong to one doctor
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorProfile doctor;

    // One slot can be referenced by an appointment
    @ManyToOne
    @JoinColumn(name = "slot_id", nullable = false)
    private AvailabilitySlot slot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    private String reasonForVisit;

    // Stores large diagnosis text
    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    // Stores large medication details
    @Column(columnDefinition = "TEXT")
    private String medications;
}
