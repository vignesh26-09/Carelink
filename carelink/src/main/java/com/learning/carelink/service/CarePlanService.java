package com.learning.carelink.service;

import com.learning.carelink.dto.CarePlanDto;
import com.learning.carelink.entity.*;
import com.learning.carelink.enums.*;
import com.learning.carelink.repository.*;
import com.learning.carelink.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor
public class CarePlanService {
    private final AppointmentRepository appointments;
    private final CareInvoiceRepository invoices;
    private final ObjectMapper json;
    @Value("${carelink.payments.demo-enabled:false}") private boolean demoEnabled;

    private Appointment lock(Long id) {
        return appointments.findByIdForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found."));
    }
    @Transactional
    public CareInvoice complete(String email, Long id, CarePlanDto dto) {
        Appointment a = lock(id);
        if (!a.getDoctor().getAccount().getEmail().equals(email)) throw new AccessDeniedException("Not your appointment.");
        if (a.getStatus() != AppointmentStatus.IN_PROGRESS || a.getInvoice() != null)
            throw new IllegalArgumentException("Only an in-progress consultation can be completed once.");
        if (dto.inPersonRequired() && (dto.referralNote() == null || dto.referralNote().isBlank()))
            throw new IllegalArgumentException("Explain why an in-person assessment is required.");
        if (dto.inPersonRequired() && !dto.medicines().isEmpty())
            throw new IllegalArgumentException("An in-person referral cannot include a medicine delivery order.");
        BigDecimal medicineTotal = dto.medicines().stream()
            .map(m -> m.unitPrice().multiply(BigDecimal.valueOf(m.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2, RoundingMode.UNNECESSARY);
        BigDecimal fee = a.getConsultationFeeSnapshot() != null ? a.getConsultationFeeSnapshot() : a.getDoctor().getConsultationFee();
        String items;
        try { items = json.writeValueAsString(dto.medicines()); }
        catch (com.fasterxml.jackson.core.JsonProcessingException ex) { throw new IllegalArgumentException("Invalid medicine details."); }
        CareInvoice invoice = invoices.save(CareInvoice.builder().appointment(a).doctorFee(fee)
            .medicineTotal(medicineTotal).total(fee.add(medicineTotal)).itemsJson(items)
            .status("ISSUED").inPersonRequired(dto.inPersonRequired()).referralNote(dto.referralNote())
            .outcome(dto.outcome().name()).issuedAt(LocalDateTime.now()).deliveryStatus("NOT_REQUESTED").build());
        a.setInvoice(invoice);
        a.setDiagnosis(dto.diagnosis().strip());
        a.setMedications(dto.medicines().stream().map(CarePlanDto.Medicine::name).collect(java.util.stream.Collectors.joining(", ")));
        a.setStatus(AppointmentStatus.COMPLETED);
        return invoice;
    }
    private CareInvoice patientInvoice(String email, Appointment a) {
        if (!a.getPatient().getAccount().getEmail().equals(email)) throw new AccessDeniedException("Not your invoice.");
        if (a.getInvoice() == null) throw new ResourceNotFoundException("An invoice has not been issued for this visit.");
        return a.getInvoice();
    }
    @Transactional
    public CareInvoice accept(String email, Long id) {
        CareInvoice invoice = patientInvoice(email, lock(id));
        if (invoice.getStatus().equals("ISSUED")) {
            invoice.setAcceptedAt(LocalDateTime.now()); invoice.setStatus("ACCEPTED");
        }
        return invoice;
    }
    @Transactional
    public CareInvoice demoPay(String email, Long id) {
        if (!demoEnabled) throw new AccessDeniedException("Demo payment is disabled.");
        CareInvoice invoice = patientInvoice(email, lock(id));
        if (invoice.getStatus().equals("DEMO_PAID")) return invoice;
        if (!invoice.getStatus().equals("ACCEPTED")) throw new IllegalArgumentException("Review and accept the invoice first.");
        invoice.setStatus("DEMO_PAID"); invoice.setPaidAt(LocalDateTime.now());
        invoice.setDeliveryStatus(!invoice.isInPersonRequired() && !invoice.getItemsJson().equals("[]") ? "DEMO_QUEUED" : "NOT_REQUIRED");
        return invoice;
    }
}
