package com.learning.carelink.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.learning.carelink.entity.Appointment;
import com.learning.carelink.entity.enums.AppointmentStatus;
import java.util.List;
public interface AppointmentRepository extends JpaRepository<Appointment ,Long>{
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment>findByDoctorIdAndStatus(Long doctorId , AppointmentStatus status  );
    Long countByPatientIdAndStatus(Long patientId , AppointmentStatus status);
}
