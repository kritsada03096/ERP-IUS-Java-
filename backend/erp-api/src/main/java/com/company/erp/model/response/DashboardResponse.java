package com.company.erp.model.response;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import com.company.erp.enums.*;
import com.company.erp.model.dto.*;
public record DashboardResponse(long departments, long activeProducts, long visibleRequests, long pendingApproval, BigDecimal approvedTotal) {}
