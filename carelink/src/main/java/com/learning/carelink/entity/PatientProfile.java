package com.learning.carelink.entity;
import jakarta.persistence.*;
import lombok.*;



@Entity
@Table(name = "patient_profiles")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
     
    @OneToOne
    @JoinColumn(name ="account_id", unique = true, nullable = false )
    private Account account;
     
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @Column(nullable = false)
    private String bloodGroup;

    @Column(nullable = false)
    private String emergencyContact;
}
