package com.company.erp.controller.approval;
import com.company.erp.service.approval.ApprovalService;
import com.company.erp.model.request.*;
import com.company.erp.model.response.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/v1/approvals")
public class ApprovalController {
    private final ApprovalService service;
    public ApprovalController(ApprovalService service) { this.service = service; }

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public List<PurchaseRequestResponse> pending() { return service.pending(); }
    @PostMapping("/{id}/decision") @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public PurchaseRequestResponse decide(@PathVariable Long id, @Valid @RequestBody ApprovalDecisionRequest request) { return service.decide(id, request); }
}
