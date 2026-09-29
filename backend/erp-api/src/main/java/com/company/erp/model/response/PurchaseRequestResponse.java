package com.company.erp.model.response;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record PurchaseRequestResponse(Long id, String number, Long requesterId, String requesterName, Long departmentId, String departmentName, String reason, PurchaseRequestStatus status, BigDecimal total, Instant createdAt, List<PurchaseItemDto> items, List<ApprovalEventResponse> history) {}
