package com.company.erp.model.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record PurchaseItemDto(Long productId, String productName, String unit, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}
