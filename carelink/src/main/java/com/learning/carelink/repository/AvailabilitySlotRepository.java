package com.learning.carelink.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.learning.carelink.entity.AvailabilitySlot;

import java.time.LocalDateTime;
import java.util.List;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot , Long > {
   List<AvailabilitySlot> findByDoctorIdAndBookedFalse(Long doctorId);
   List<AvailabilitySlot> findByDoctorId(Long doctorId);
   @Query("""
            SELECT COUNT(a) > 0
            FROM AvailabilitySlot a
            WHERE a.doctor.id = :doctorId
            AND a.startTime < :end
            AND a.endTime > :start
            """)  
    boolean existsOverlapping(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
} 
