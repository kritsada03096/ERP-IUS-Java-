package com.company.erp.model.response;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record ProductResponse(Long id, String sku, String name, String unit, BigDecimal price, boolean active) {}
