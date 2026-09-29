package com.company.erp.service.approval;
import com.company.erp.enums.*;
import com.company.erp.exception.BusinessException;
import com.company.erp.model.request.ApprovalDecisionRequest;
import com.company.erp.model.response.PurchaseRequestResponse;
import com.company.erp.service.auth.AuthService;
import com.company.erp.service.procurement.PurchaseRequestService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@Transactional(readOnly = true)
public class ApprovalService {
    private final PurchaseRequestService purchases;
    private final AuthService auth;
    public ApprovalService(PurchaseRequestService purchases, AuthService auth) { this.purchases = purchases; this.auth = auth; }
    public List<PurchaseRequestResponse> pending() {
        var actor = auth.currentUser();
        return purchases.list().stream().filter(p -> p.status() == PurchaseRequestStatus.PENDING_APPROVAL && !p.requesterId().equals(actor.getId())).toList();
    }
    @Transactional
    public PurchaseRequestResponse decide(Long id, ApprovalDecisionRequest decision) {
        var actor = auth.currentUser(); var p = purchases.locked(id);
        if (actor.getRole() == Role.EMPLOYEE || (actor.getRole() == Role.MANAGER && !actor.getDepartment().getId().equals(p.getDepartment().getId())))
            throw new AccessDeniedException("Cannot approve this department");
        if (actor.getId().equals(p.getRequester().getId())) throw new BusinessException("ไม่สามารถอนุมัติใบขอซื้อของตัวเอง");
        if (p.getStatus() != PurchaseRequestStatus.PENDING_APPROVAL) throw new BusinessException("รายการนี้ไม่ได้อยู่ระหว่างรออนุมัติ");
        p.setStatus(decision.approved() ? PurchaseRequestStatus.APPROVED : PurchaseRequestStatus.REJECTED);
        purchases.record(p, actor, p.getStatus().name(), decision.comment().trim());
        return purchases.response(p);
    }
}
