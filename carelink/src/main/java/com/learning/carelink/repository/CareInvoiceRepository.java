package com.learning.carelink.repository;
import com.learning.carelink.entity.CareInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CareInvoiceRepository extends JpaRepository<CareInvoice, Long> {}
