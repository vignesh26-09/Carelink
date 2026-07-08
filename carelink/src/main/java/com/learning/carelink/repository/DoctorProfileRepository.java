  package com.learning.carelink.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.learning.carelink.entity.DoctorProfile;
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByAccountId(Long accountId);

    boolean existsByAccountId(Long accountId);
}