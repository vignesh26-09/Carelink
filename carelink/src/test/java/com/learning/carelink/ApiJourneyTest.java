package com.learning.carelink;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learning.carelink.entity.*;
import com.learning.carelink.enums.Role;
import com.learning.carelink.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class ApiJourneyTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired AccountRepository accounts;
    @Autowired DoctorProfileRepository doctors;
    @Autowired AvailabilitySlotRepository slots;
    @Autowired PasswordEncoder encoder;
    static final String PASSWORD = "Test-only-password-2026!";
    DoctorProfile doctor;
    String docToken, patientToken, adminToken;
    @BeforeEach void setup() throws Exception {
        Account doc=accounts.save(Account.builder().email("doctor@journey.test").password(encoder.encode(PASSWORD)).role(Role.DOCTOR).build());
        doctor=doctors.save(DoctorProfile.builder().account(doc).fullName("Test Doctor").specialization("General medicine").consultationFee(new BigDecimal("800")).yearsOfExperience(10).build());
        accounts.save(Account.builder().email("admin@journey.test").password(encoder.encode(PASSWORD)).role(Role.CLINIC_ADMIN).build());
        docToken=login("doctor@journey.test"); adminToken=login("admin@journey.test");
        patientToken=register("patient@journey.test");
    }
    String register(String email) throws Exception {
        return result(mvc.perform(post("/api/auth/register").contentType("application/json").content(json.writeValueAsString(Map.of(
            "email",email,"password",PASSWORD,"fullName","Test Patient","bloodGroup","O+","emergencyContact","0000000000"))))
            .andExpect(status().isOk())).get("token").asText();
    }
    String login(String email) throws Exception {
        return result(mvc.perform(post("/api/auth/login").contentType("application/json").content(json.writeValueAsString(Map.of("email",email,"password",PASSWORD))))
            .andExpect(status().isOk())).get("token").asText();
    }
    JsonNode result(ResultActions request) throws Exception { return json.readTree(request.andReturn().getResponse().getContentAsString()); }
    long createSlot(int hours) throws Exception {
        LocalDateTime start=LocalDateTime.now().plusDays(2).withHour(hours).withMinute(0).withSecond(0).withNano(0);
        mvc.perform(post("/api/schedule/slots").header("Authorization","Bearer "+docToken)
            .param("start",start.toString()).param("end",start.plusMinutes(30).toString())).andExpect(status().isOk());
        return result(mvc.perform(get("/api/schedule/my").header("Authorization","Bearer "+docToken)).andExpect(status().isOk()))
            .get(slots.findByDoctorId(doctor.getId()).size()-1).get("id").asLong();
    }
    long book(long slot, String token) throws Exception {
        return result(mvc.perform(post("/api/appointments/book").header("Authorization","Bearer "+token).contentType("application/json")
            .content(json.writeValueAsString(Map.of("slotId",slot,"reasonForVisit","Synthetic test visit")))).andExpect(status().isOk())).get("id").asLong();
    }
    @Test void fullConsultationJourney() throws Exception {
        long slot=createSlot(9);
        mvc.perform(get("/api/schedule/slots/"+doctor.getId())).andExpect(status().isOk()).andExpect(jsonPath("$[0].booked").value(false));
        long appointment=book(slot,patientToken);
        mvc.perform(get("/api/appointments/my").header("Authorization","Bearer "+patientToken)).andExpect(status().isOk()).andExpect(jsonPath("$[0].status").value("PENDING"));
        mvc.perform(get("/api/appointments/my").header("Authorization","Bearer "+docToken)).andExpect(status().isOk()).andExpect(jsonPath("$[0].patient.fullName").value("Test Patient"));
        mvc.perform(post("/api/consultations/"+appointment+"/approve").header("Authorization","Bearer "+docToken)).andExpect(status().isOk());
        mvc.perform(post("/api/consultations/"+appointment+"/start").header("Authorization","Bearer "+docToken)).andExpect(status().isOk());
        mvc.perform(post("/api/consultations/"+appointment+"/finalize").header("Authorization","Bearer "+docToken)
            .param("diagnosis","Synthetic test completed").param("medicationsJson","[]")).andExpect(status().isOk());
        mvc.perform(get("/api/appointments/my").header("Authorization","Bearer "+patientToken)).andExpect(status().isOk())
            .andExpect(jsonPath("$[0].status").value("COMPLETED")).andExpect(jsonPath("$[0].diagnosis").value("Synthetic test completed"))
            .andExpect(jsonPath("$[0].patient.account.password").doesNotExist());
        mvc.perform(put("/api/appointments/cancel/"+appointment).header("Authorization","Bearer "+patientToken)).andExpect(status().isBadRequest());
        mvc.perform(get("/api/appointments").header("Authorization","Bearer "+adminToken)).andExpect(status().isOk());
        mvc.perform(get("/api/patients").header("Authorization","Bearer "+adminToken)).andExpect(status().isOk());
    }
    long inProgress() throws Exception {
        long id=book(createSlot(14),patientToken);
        mvc.perform(post("/api/consultations/"+id+"/approve").header("Authorization","Bearer "+docToken)).andExpect(status().isOk());
        mvc.perform(post("/api/consultations/"+id+"/start").header("Authorization","Bearer "+docToken)).andExpect(status().isOk());
        return id;
    }
    String plan(boolean referral) throws Exception {
        return json.writeValueAsString(Map.of("diagnosis","Synthetic care plan","outcome","FOLLOW_UP",
            "inPersonRequired",referral,"referralNote",referral?"Attend an in-person assessment.":"",
            "medicines",referral?java.util.List.of():java.util.List.of(Map.of("name","Test medicine","instructions","Test instructions only","quantity",2,"unitPrice",new BigDecimal("25.50")))));
    }
    @Test void invoiceAcceptanceDemoPaymentAndTotalsAreProtected() throws Exception {
        long id=inProgress();
        mvc.perform(post("/api/consultations/"+id+"/care-plan").header("Authorization","Bearer "+patientToken)
            .contentType("application/json").content(plan(false))).andExpect(status().isForbidden());
        mvc.perform(post("/api/consultations/"+id+"/care-plan").header("Authorization","Bearer "+docToken)
            .contentType("application/json").content(plan(false))).andExpect(status().isOk())
            .andExpect(jsonPath("$.doctorFee").value(800)).andExpect(jsonPath("$.medicineTotal").value(51))
            .andExpect(jsonPath("$.total").value(851)).andExpect(jsonPath("$.status").value("ISSUED"));
        mvc.perform(post("/api/appointments/"+id+"/demo-pay").header("Authorization","Bearer "+patientToken)).andExpect(status().isBadRequest());
        String other=register("outsider@journey.test");
        mvc.perform(post("/api/appointments/"+id+"/accept").header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
        mvc.perform(post("/api/appointments/"+id+"/accept").header("Authorization","Bearer "+patientToken)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACCEPTED"));
        for(int retry=0;retry<2;retry++) mvc.perform(post("/api/appointments/"+id+"/demo-pay").header("Authorization","Bearer "+patientToken))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DEMO_PAID")).andExpect(jsonPath("$.deliveryStatus").value("DEMO_QUEUED"));
        mvc.perform(get("/api/dashboard").header("Authorization","Bearer "+adminToken)).andExpect(status().isOk())
            .andExpect(jsonPath("$.demoGrossRevenue").value(851)).andExpect(jsonPath("$.demoDoctorEarnings").value(800))
            .andExpect(jsonPath("$.patientsConsulted").value(1)).andExpect(jsonPath("$.patientsReportedRecovered").value(0));
        mvc.perform(get("/api/dashboard").header("Authorization","Bearer "+other)).andExpect(status().isOk()).andExpect(jsonPath("$.completedVisits").value(0));
        mvc.perform(post("/api/consultations/"+id+"/care-plan").header("Authorization","Bearer "+docToken)
            .contentType("application/json").content(plan(false))).andExpect(status().isBadRequest());
    }
    @Test void referralCreatesFeeOnlyInvoiceWithoutDelivery() throws Exception {
        long id=inProgress();
        mvc.perform(post("/api/consultations/"+id+"/care-plan").header("Authorization","Bearer "+docToken).contentType("application/json").content(plan(true)))
            .andExpect(status().isOk()).andExpect(jsonPath("$.inPersonRequired").value(true)).andExpect(jsonPath("$.medicineTotal").value(0));
        mvc.perform(post("/api/appointments/"+id+"/accept").header("Authorization","Bearer "+patientToken)).andExpect(status().isOk());
        mvc.perform(post("/api/appointments/"+id+"/demo-pay").header("Authorization","Bearer "+patientToken))
            .andExpect(status().isOk()).andExpect(jsonPath("$.deliveryStatus").value("NOT_REQUIRED"));
    }
    @Test void slotRemovalPreservesBookingsAndPreventsReuse() throws Exception {
        long slot=createSlot(15);
        mvc.perform(delete("/api/schedule/slots/"+slot).header("Authorization","Bearer "+patientToken)).andExpect(status().isForbidden());
        mvc.perform(delete("/api/schedule/slots/"+slot).header("Authorization","Bearer "+docToken)).andExpect(status().isOk());
        mvc.perform(get("/api/schedule/slots/"+doctor.getId())).andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mvc.perform(post("/api/appointments/book").header("Authorization","Bearer "+patientToken).contentType("application/json")
            .content(json.writeValueAsString(Map.of("slotId",slot,"reasonForVisit","Removed slot")))).andExpect(status().isBadRequest());
        long booked=createSlot(16);book(booked,patientToken);
        mvc.perform(delete("/api/schedule/slots/"+booked).header("Authorization","Bearer "+docToken)).andExpect(status().isBadRequest());
    }
    @Test void onlyAdministratorCanCreateDoctor() throws Exception {
        String body=json.writeValueAsString(Map.of("fullName","New Doctor","email","new-doctor@journey.test","password",PASSWORD,
            "specialization","General medicine","consultationFee",900,"yearsOfExperience",3));
        mvc.perform(post("/api/doctors").header("Authorization","Bearer "+patientToken).contentType("application/json").content(body)).andExpect(status().isForbidden());
        mvc.perform(post("/api/doctors").header("Authorization","Bearer "+adminToken).contentType("application/json").content(body)).andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName").value("New Doctor")).andExpect(jsonPath("$.account.password").doesNotExist());
        mvc.perform(post("/api/doctors").header("Authorization","Bearer "+adminToken).contentType("application/json").content(body)).andExpect(status().isBadRequest());
        String newToken=login("new-doctor@journey.test");
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+newToken)).andExpect(status().isOk()).andExpect(jsonPath("$.role").value("DOCTOR"));
    }
    @Test void staleSessionDoesNotBreakPublicPages() throws Exception {
        mvc.perform(get("/api/doctors").header("Authorization","Bearer stale-token")).andExpect(status().isOk()).andExpect(jsonPath("$[0].account.password").doesNotExist());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer stale-token")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+patientToken)).andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("PATIENT")).andExpect(jsonPath("$.fullName").value("Test Patient"))
            .andExpect(jsonPath("$.bloodGroup").value("O+")).andExpect(jsonPath("$.password").doesNotExist());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+docToken)).andExpect(status().isOk())
            .andExpect(jsonPath("$.fullName").value("Test Doctor")).andExpect(jsonPath("$.specialization").value("General medicine"))
            .andExpect(jsonPath("$.bloodGroup").doesNotExist());
        mvc.perform(post("/api/auth/login").contentType("application/json").content("{\"email\":\"patient@journey.test\",\"password\":\"wrong\"}")).andExpect(status().isUnauthorized());
    }
    @Test void rolesAndOwnershipAreEnforced() throws Exception {
        long id=book(createSlot(10),patientToken);
        String other=register("other@journey.test");
        mvc.perform(put("/api/appointments/cancel/"+id).header("Authorization","Bearer "+other)).andExpect(status().isForbidden());
        mvc.perform(get("/api/patients").header("Authorization","Bearer "+patientToken)).andExpect(status().isForbidden());
        mvc.perform(get("/api/appointments").header("Authorization","Bearer "+docToken)).andExpect(status().isForbidden());
        mvc.perform(post("/api/consultations/"+id+"/approve").header("Authorization","Bearer "+patientToken)).andExpect(status().isForbidden());
        mvc.perform(delete("/api/doctors/"+doctor.getId()).header("Authorization","Bearer "+patientToken)).andExpect(status().isForbidden());
    }
    @Test void cancellationReleasesSlotAndPreventsDoubleBooking() throws Exception {
        long slot=createSlot(11); long appointment=book(slot,patientToken);
        mvc.perform(post("/api/appointments/book").header("Authorization","Bearer "+patientToken).contentType("application/json")
            .content(json.writeValueAsString(Map.of("slotId",slot,"reasonForVisit","Duplicate")))).andExpect(status().isBadRequest());
        mvc.perform(put("/api/appointments/cancel/"+appointment).header("Authorization","Bearer "+patientToken)).andExpect(status().isNoContent());
        assertThat(slots.findById(slot).orElseThrow().isBooked()).isFalse();
        book(slot,patientToken);
    }
    @Test void validatesTimesAndRegistration() throws Exception {
        createSlot(12);
        LocalDateTime start=LocalDateTime.now().plusDays(2).withHour(12).withMinute(0).withSecond(0).withNano(0);
        mvc.perform(post("/api/schedule/slots").header("Authorization","Bearer "+docToken).param("start",start.toString())
            .param("end",start.plusMinutes(20).toString())).andExpect(status().isBadRequest());
        mvc.perform(post("/api/schedule/slots").header("Authorization","Bearer "+docToken)
            .param("start",LocalDateTime.now().minusDays(1).toString()).param("end",LocalDateTime.now().toString())).andExpect(status().isBadRequest());
        mvc.perform(post("/api/auth/register").contentType("application/json").content("{}")).andExpect(status().isBadRequest());
    }
    @Test void adminDeactivationBlocksExistingTokensWithoutDeletingHistory() throws Exception {
        long appointment=book(createSlot(13),patientToken);
        long patientId=result(mvc.perform(get("/api/patients").header("Authorization","Bearer "+adminToken)).andExpect(status().isOk())).get(0).get("id").asLong();
        mvc.perform(delete("/api/patients/"+patientId).header("Authorization","Bearer "+adminToken)).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+patientToken)).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/doctors/"+doctor.getId()).header("Authorization","Bearer "+adminToken)).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").header("Authorization","Bearer "+docToken)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/doctors")).andExpect(status().isOk()).andExpect(jsonPath("$").isEmpty());
        mvc.perform(get("/api/appointments").header("Authorization","Bearer "+adminToken)).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(appointment));
    }
}
