package com.learning.carelink.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.learning.carelink.entity.Account;
import com.learning.carelink.entity.Appointment;
import com.learning.carelink.entity.DoctorProfile;
import com.learning.carelink.enums.AppointmentStatus;
import com.learning.carelink.enums.Role;
import com.learning.carelink.repository.AccountRepository;
import com.learning.carelink.repository.AppointmentRepository;
import com.learning.carelink.repository.DoctorProfileRepository;
import com.learning.carelink.service.impl.ConsultationServiceImp;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ConsultationServiceImpTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private DoctorProfileRepository doctorProfileRepository;
    @Mock private AccountRepository accountRepository;
    @InjectMocks private ConsultationServiceImp service;

    @Test
    void finalizingConsultationPersistsDiagnosisMedicationAndCompletion() {
        Account account = Account.builder().id(1L).email("doctor@example.test").role(Role.DOCTOR).build();
        DoctorProfile doctor = DoctorProfile.builder().id(2L).account(account).build();
        Appointment appointment = Appointment.builder()
                .id(3L).doctor(doctor).status(AppointmentStatus.IN_PROGRESS).build();

        when(accountRepository.findByEmail(account.getEmail())).thenReturn(Optional.of(account));
        when(doctorProfileRepository.findByAccountId(account.getId())).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findByIdForUpdate(appointment.getId())).thenReturn(Optional.of(appointment));

        service.finalizeConsultation(account.getEmail(), appointment.getId(), "Seasonal flu", "[\"Paracetamol\"]");

        ArgumentCaptor<Appointment> saved = ArgumentCaptor.forClass(Appointment.class);
        verify(appointmentRepository).save(saved.capture());
        assertThat(saved.getValue().getDiagnosis()).isEqualTo("Seasonal flu");
        assertThat(saved.getValue().getMedications()).isEqualTo("Paracetamol");
        assertThat(saved.getValue().getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
    }
}
