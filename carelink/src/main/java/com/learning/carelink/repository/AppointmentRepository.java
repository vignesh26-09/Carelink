package com.learning.carelink.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.learning.carelink.entity.Appointment;
import com.learning.carelink.enums.AppointmentStatus;

import java.util.List;
public interface AppointmentRepository extends JpaRepository<Appointment ,Long>{
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from Appointment a where a.id = :id")
    java.util.Optional<Appointment> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByPatientAccountId(Long accountId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment>findByDoctorIdAndStatus(Long doctorId , AppointmentStatus status  );
    Long countByPatientIdAndStatus(Long patientId , AppointmentStatus status);
}
