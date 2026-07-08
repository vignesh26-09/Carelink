package com.learning.carelink.service.impl;
import com.learning.carelink.repository.PatientProfileRepository;
import java.util.List;
import com.learning.carelink.service.PatientService;
import com.learning.carelink.entity.PatientProfile;
import com.learning.carelink.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import lombok.*;
@Service
@RequiredArgsConstructor
public class PatientServiceImp implements PatientService {
    private final PatientProfileRepository patientProfileRepository;

    @Override
    public List<PatientProfile> getAllPatients(){
        return patientProfileRepository.findAll();
    }

    @Override
    public void deletePatient(Long id){
        PatientProfile patientProfile= patientProfileRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Patient Not found"));
        patientProfileRepository.delete(patientProfile);
    }
}
