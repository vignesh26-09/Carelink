package com.learning.carelink.repository;
import com.learning.carelink.entity.PatientProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface PatientProfileRepository extends JpaRepository<PatientProfile ,Long> {
   Optional <PatientProfile> findByAccountId(Long accountId);
   boolean existsByAccountId(Long accountId);
    
}
