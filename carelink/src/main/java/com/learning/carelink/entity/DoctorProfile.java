package com.learning.carelink.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctor_profiles")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
     
    @OneToOne
    @JoinColumn(name ="account_id", unique = true, nullable = false )
    private Account account;
     
    @Column(nullable = false)
    private String specialization;

    @Column(name = "consultation_fee" , nullable = false)
    private BigDecimal consultationFee;

    private Integer yearsOfExperience;

    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AvailabilitySlot> availabilitySlots = new ArrayList<>();
}
