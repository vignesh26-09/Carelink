package com.learning.carelink.service;
import java.util.List;
import com.learning.carelink.entity.PatientProfile;
public interface PatientService {
    List<PatientProfile> getAllPatients();
    void deletePatient(Long id);
}
