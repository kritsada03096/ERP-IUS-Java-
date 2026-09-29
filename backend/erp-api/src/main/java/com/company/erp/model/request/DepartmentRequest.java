package com.company.erp.model.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record DepartmentRequest(@NotBlank @Pattern(regexp = "[A-Z0-9_-]{2,30}") String code, @NotBlank @Size(max = 120) String name) {}
