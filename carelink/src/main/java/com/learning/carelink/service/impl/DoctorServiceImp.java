package com.learning.carelink.service.impl;
import java.util.List;

import org.springframework.stereotype.Service;
import com.learning.carelink.exception.ResourceNotFoundException;
import com.learning.carelink.service.DoctorService;
import com.learning.carelink.entity.DoctorProfile;
import com.learning.carelink.repository.DoctorProfileRepository;
import lombok.*;
@Service
@RequiredArgsConstructor
public class DoctorServiceImp implements DoctorService{
    private final DoctorProfileRepository doctorProfileRepository;
    
    @Override
    public List<DoctorProfile> getAllDoctors(){
        return doctorProfileRepository.findAll();
    }
    @Override
    public void deleteDoctor(Long id){
        DoctorProfile doctorProfile = doctorProfileRepository.findById(id).
        orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        doctorProfileRepository.delete(doctorProfile);
    }
}
