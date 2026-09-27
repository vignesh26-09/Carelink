package com.learning.carelink.config;

import com.learning.carelink.entity.*;
import com.learning.carelink.enums.Role;
import com.learning.carelink.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.annotation.Profile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@Profile("dev")
@ConditionalOnProperty(name = "carelink.seed.enabled", havingValue = "true")
public class DatabaseSeeder implements CommandLineRunner {
    private final AccountRepository accounts;
    private final DoctorProfileRepository doctors;
    private final AvailabilitySlotRepository slots;
    private final PasswordEncoder encoder;
    @Value("${carelink.demo.doctor-password:${CARELINK_SEED_DOCTOR_PASSWORD:}}")
    private String doctorPassword;
    @Value("${carelink.demo.admin-password:${CARELINK_SEED_ADMIN_PASSWORD:}}")
    private String adminPassword;
    @Value("${carelink.demo.reset-passwords:false}")
    private boolean resetPasswords;
    public DatabaseSeeder(AccountRepository accounts, DoctorProfileRepository doctors,
                          AvailabilitySlotRepository slots, PasswordEncoder encoder) {
        this.accounts = accounts; this.doctors = doctors; this.slots = slots; this.encoder = encoder;
    }
    @Override @Transactional
    public void run(String... args) {
        if (doctorPassword.length() < 12 || adminPassword.length() < 12)
            throw new IllegalStateException("Development account passwords must be at least 12 characters.");
        seedDoctor("cardiologist@carelink.com", "Ananya Rao", "Cardiology", 12, "1500");
        seedDoctor("dermatologist@carelink.com", "Vikram Shah", "Dermatology", 8, "1200");
        seedDoctor("physician@carelink.com", "Meera Iyer", "General medicine", 10, "800");
        if (!accounts.existsByEmail("admin@carelink.com")) accounts.save(Account.builder()
            .email("admin@carelink.com").password(encoder.encode(adminPassword)).role(Role.CLINIC_ADMIN).build());
        else if (resetPasswords) accounts.findByEmail("admin@carelink.com").orElseThrow().setPassword(encoder.encode(adminPassword));
    }
    private void seedDoctor(String email, String name, String specialty, int years, String fee) {
        Account account = accounts.findByEmail(email).orElseGet(() -> accounts.save(Account.builder()
            .email(email).password(encoder.encode(doctorPassword)).role(Role.DOCTOR).build()));
        if (resetPasswords) account.setPassword(encoder.encode(doctorPassword));
        DoctorProfile doctor = doctors.findByAccountId(account.getId()).orElseGet(() -> doctors.save(
            DoctorProfile.builder().account(account).fullName(name).specialization(specialty)
            .consultationFee(new BigDecimal(fee)).yearsOfExperience(years).build()));
        if (doctor.getFullName() == null) { doctor.setFullName(name); doctors.save(doctor); }
        // Only create slots for a new schedule; never rewrite real bookings or passwords.
        if (slots.findByDoctorIdAndBookedFalse(doctor.getId()).stream().noneMatch(s -> s.getStartTime().isAfter(LocalDateTime.now()))) {
            for (int day = 1; day <= 3; day++) for (int hour = 13; hour <= 15; hour++) {
                LocalDateTime start = LocalDateTime.now().plusDays(day).withHour(hour).withMinute(0).withSecond(0).withNano(0);
                if (slots.existsOverlapping(doctor.getId(), start, start.plusMinutes(30))) continue;
                slots.save(AvailabilitySlot.builder().doctor(doctor).startTime(start).endTime(start.plusMinutes(30)).booked(false).build());
            }
        }
    }
}
