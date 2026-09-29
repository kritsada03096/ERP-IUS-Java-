package com.company.erp.model.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record ProductRequest(@NotBlank @Pattern(regexp = "[A-Z0-9_-]{2,40}") String sku, @NotBlank @Size(max = 160) String name, @NotBlank @Size(max = 30) String unit, @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal price) {}
