package com.company.erp.model.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record LoginRequest(@NotBlank @Size(max = 60) String username, @NotBlank @Size(max = 100) String password) {
    @Override public String toString() { return "LoginRequest[credentials=REDACTED]"; }
}
