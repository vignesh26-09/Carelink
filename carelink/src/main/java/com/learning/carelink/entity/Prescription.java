package com.learning.carelink.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescriptions")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One prescription belongs to one appointment
    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "medications_json", nullable = false, columnDefinition = "TEXT")
    private String medicationsJson;

    // Default = false (not yet dispensed)
    @Builder.Default
    private boolean dispensed = false;

}