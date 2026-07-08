package com.learning.carelink.service;
import com.learning.carelink.entity.DoctorProfile;
import java.util.List;
public interface DoctorService {
   List<DoctorProfile> getAllDoctors();
   void deleteDoctor(Long id);
}