package com.learning.carelink.repository;
import com.learning.carelink.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PrescriptionRepository extends JpaRepository<Prescription , Long> {
    Optional<Prescription> findByAppointmentId(Long AppointmenId);
}
