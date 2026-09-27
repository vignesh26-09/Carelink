package com.learning.carelink.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "care_invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CareInvoice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @JsonIgnore @OneToOne @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal doctorFee;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal medicineTotal;
    @Column(nullable = false, precision = 12, scale = 2) private BigDecimal total;
    @Column(nullable = false, columnDefinition = "TEXT") private String itemsJson;
    @Column(nullable = false) private String status;
    @Column(nullable = false) private boolean inPersonRequired;
    @Column(columnDefinition = "TEXT") private String referralNote;
    @Column(nullable = false) private String outcome;
    @Column(nullable = false) private LocalDateTime issuedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime paidAt;
    private String deliveryStatus;
}
