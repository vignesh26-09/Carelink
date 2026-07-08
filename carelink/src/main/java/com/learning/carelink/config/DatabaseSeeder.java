package com.learning.carelink.config;

import com.learning.carelink.entity.enums.Role;
import com.learning.carelink.entity.Account;
import com.learning.carelink.entity.DoctorProfile;
import com.learning.carelink.entity.AvailabilitySlot;
// Import your repositories here (Adjust package paths as necessary)
import com.learning.carelink.repository.AccountRepository;
import com.learning.carelink.repository.DoctorProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Component
public class DatabaseSeeder implements CommandLineRunner {

        private final AccountRepository accountRepository;
        private final DoctorProfileRepository doctorProfileRepository;
        private final PasswordEncoder passwordEncoder;

        // Constructor injection for required dependencies
        public DatabaseSeeder(AccountRepository accountRepository,
                        DoctorProfileRepository doctorProfileRepository,
                        PasswordEncoder passwordEncoder) {
                this.accountRepository = accountRepository;
                this.doctorProfileRepository = doctorProfileRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        @Transactional // Ensures all cascading saves execute cleanly inside one transaction boundary
        public void run(String... args) throws Exception {

                // 1. Check if doctors already exist to avoid seeding duplicate data
                if (doctorProfileRepository.count() > 0) {
                        System.out.println(
                                        ">>> Database already seeded with doctor profiles. Skipping initialization.");
                        return;
                }

                System.out.println(">>> Database empty. Initializing mock doctor profile data...");

                // 2. Seed Doctor 1: Cardiologist
                Account docAccount1 = Account.builder()
                                .email("cardiologist@carelink.com")
                                .password(passwordEncoder.encode("DoctorPassword123"))
                                .role(Role.DOCTOR)
                                .active(true)
                                .build();
                accountRepository.save(docAccount1);

                DoctorProfile doctor1 = DoctorProfile.builder()
                                .account(docAccount1)
                                .specialization("Cardiology")
                                .consultationFee(new BigDecimal("1500.00"))
                                .yearsOfExperience(12)
                                .availabilitySlots(new ArrayList<>()) // Initialize list for Builder safety
                                .build();

                // Attach sample availability slots to Doctor 1
                doctor1.getAvailabilitySlots().add(AvailabilitySlot.builder()
                                .startTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0))
                                .endTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                                .doctor(doctor1) // Set back-reference for bidirectional mapping
                                .booked(true)
                                .build());

                doctor1.getAvailabilitySlots().add(AvailabilitySlot.builder()
                                .startTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(30))
                                .endTime(LocalDateTime.now().plusDays(1).withHour(11).withMinute(30))
                                .doctor(doctor1)
                                .booked(true)
                                .build());

                doctorProfileRepository.save(doctor1);

                // 3. Seed Doctor 2: Dermatologist
                Account docAccount2 = Account.builder()
                                .email("dermatologist@carelink.com")
                                .password(passwordEncoder.encode("DoctorPassword123"))
                                .role(Role.DOCTOR)
                                .active(true)
                                .build();

                accountRepository.save(docAccount2);

                DoctorProfile doctor2 = DoctorProfile.builder()
                                .account(docAccount2)
                                .specialization("Dermatology")
                                .consultationFee(new BigDecimal("1200.00"))
                                .yearsOfExperience(8)
                                .availabilitySlots(new ArrayList<>())
                                .build();

                doctor2.getAvailabilitySlots().add(AvailabilitySlot.builder()
                                .startTime(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0))
                                .endTime(LocalDateTime.now().plusDays(2).withHour(15).withMinute(0))
                                .doctor(doctor2)
                                .booked(true)
                                .build());

                doctorProfileRepository.save(doctor2);

                System.out.println(">>> Successfully seeded 2 Doctor Profiles with Availability Slots!");

                // 4. Seed Clinic Admin
                Account adminAccount = Account.builder()
                                .email("admin@carelink.com")
                                .password(passwordEncoder.encode("AdminPassword123"))
                                .role(Role.CLINIC_ADMIN)
                                .active(true)
                                .build();

                accountRepository.save(adminAccount);
        }
}