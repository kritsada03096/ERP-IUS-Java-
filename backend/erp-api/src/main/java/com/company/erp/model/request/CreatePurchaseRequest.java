package com.company.erp.model.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record CreatePurchaseRequest(@NotBlank @Size(max = 1000) String reason, @NotEmpty @Size(max = 100) List<@NotNull @Valid PurchaseItemRequest> items) {}
