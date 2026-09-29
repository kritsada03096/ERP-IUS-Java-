package com.company.erp.model.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record PurchaseItemRequest(@NotNull @Positive Long productId, @Min(1) @Max(100000) int quantity) {}
