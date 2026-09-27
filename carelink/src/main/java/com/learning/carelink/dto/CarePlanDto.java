package com.learning.carelink.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
public record CarePlanDto(
    @NotBlank @Size(max=5000) String diagnosis,
    @NotNull @Size(max=30) List<@Valid Medicine> medicines,
    boolean inPersonRequired,
    @Size(max=2000) String referralNote,
    @NotNull Outcome outcome
) {
    public enum Outcome { NOT_RECORDED, FOLLOW_UP, IMPROVED, RECOVERED }
    public record Medicine(
        @NotBlank @Size(max=120) String name,
        @NotBlank @Size(max=500) String instructions,
        @Min(1) @Max(1000) int quantity,
        @NotNull @DecimalMin("0.00") @DecimalMax("100000.00") @Digits(integer=6, fraction=2) BigDecimal unitPrice
    ) {}
}
