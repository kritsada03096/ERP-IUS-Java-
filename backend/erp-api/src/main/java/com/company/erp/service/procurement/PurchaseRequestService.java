package com.company.erp.service.procurement;
import com.company.erp.enums.*;
import com.company.erp.exception.*;
import com.company.erp.mapper.ErpMapper;
import com.company.erp.model.entity.*;
import com.company.erp.model.request.CreatePurchaseRequest;
import com.company.erp.model.response.PurchaseRequestResponse;
import com.company.erp.repository.*;
import com.company.erp.service.auth.AuthService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
@Service
@Transactional(readOnly = true)
public class PurchaseRequestService {
    private final PurchaseRequestRepository requests;
    private final ProductRepository products;
    private final ApprovalEventRepository events;
    private final AuthService auth;
    public PurchaseRequestService(PurchaseRequestRepository requests, ProductRepository products, ApprovalEventRepository events, AuthService auth) {
        this.requests = requests; this.products = products; this.events = events; this.auth = auth;
    }
    public List<PurchaseRequestResponse> list() {
        User actor = auth.currentUser();
        var visible = switch (actor.getRole()) {
            case ADMIN -> requests.findAllByOrderByCreatedAtDesc();
            case MANAGER -> requests.findByDepartmentIdOrderByCreatedAtDesc(actor.getDepartment().getId());
            case EMPLOYEE -> requests.findByRequesterIdOrderByCreatedAtDesc(actor.getId());
        };
        return visible.stream().map(this::response).toList();
    }
    public PurchaseRequestResponse get(Long id) {
        var p = requests.findById(id).orElseThrow(() -> new ResourceNotFoundException("ไม่พบใบขอซื้อ"));
        checkVisible(p, auth.currentUser()); return response(p);
    }
    @Transactional
    public PurchaseRequestResponse create(CreatePurchaseRequest request) {
        User actor = auth.currentUser();
        PurchaseRequest p = new PurchaseRequest();
        p.setNumber("PR-" + UUID.randomUUID().toString().toUpperCase(Locale.ROOT));
        p.setRequester(actor); p.setDepartment(actor.getDepartment()); p.setReason(request.reason().trim());
        p.setStatus(PurchaseRequestStatus.DRAFT); p.setCreatedAt(Instant.now());
        BigDecimal total = BigDecimal.ZERO;
        Set<Long> seen = new HashSet<>();
        for (var line : request.items()) {
            if (!seen.add(line.productId())) throw new BusinessException("สินค้าในใบขอซื้อห้ามซ้ำ");
            var product = products.findById(line.productId()).orElseThrow(() -> new ResourceNotFoundException("ไม่พบสินค้า"));
            if (!product.getActive()) throw new BusinessException("สินค้าถูกปิดใช้งาน");
            var item = new PurchaseRequestItem();
            item.setPurchaseRequest(p); item.setProduct(product); item.setProductName(product.getName()); item.setUnit(product.getUnit());
            item.setQuantity(line.quantity()); item.setUnitPrice(product.getPrice());
            item.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
            total = total.add(item.getLineTotal()); p.getItems().add(item);
        }
        if (total.compareTo(new BigDecimal("9999999999999999.99")) > 0) throw new BusinessException("ยอดรวมเกินวงเงินที่ระบบรองรับ");
        p.setTotal(total); requests.save(p); record(p, actor, "CREATED", "");
        return response(p);
    }
    @Transactional
    public PurchaseRequestResponse submit(Long id) {
        PurchaseRequest p = locked(id); User actor = auth.currentUser();
        if (!p.getRequester().getId().equals(actor.getId())) throw new AccessDeniedException("Only requester can submit");
        if (p.getStatus() != PurchaseRequestStatus.DRAFT) throw new BusinessException("ส่งอนุมัติได้เฉพาะเอกสารฉบับร่าง");
        if (p.getItems().stream().anyMatch(i -> !i.getProduct().getActive())) throw new BusinessException("มีสินค้าที่ถูกปิดใช้งาน กรุณาสร้างใบขอซื้อใหม่");
        p.setStatus(PurchaseRequestStatus.PENDING_APPROVAL); record(p, actor, "SUBMITTED", "");
        return response(p);
    }
    public PurchaseRequest locked(Long id) { return requests.findForUpdate(id).orElseThrow(() -> new ResourceNotFoundException("ไม่พบใบขอซื้อ")); }
    public PurchaseRequestResponse response(PurchaseRequest p) { return ErpMapper.purchase(p, events.findByPurchaseRequestIdOrderByCreatedAtAscIdAsc(p.getId())); }
    public void record(PurchaseRequest p, User actor, String action, String comment) {
        ApprovalEvent event = new ApprovalEvent(); event.setPurchaseRequest(p); event.setActor(actor); event.setAction(action);
        event.setComment(comment); event.setCreatedAt(Instant.now()); events.save(event);
    }
    private void checkVisible(PurchaseRequest p, User actor) {
        boolean allowed = actor.getRole() == Role.ADMIN || p.getRequester().getId().equals(actor.getId())
            || (actor.getRole() == Role.MANAGER && p.getDepartment().getId().equals(actor.getDepartment().getId()));
        if (!allowed) throw new AccessDeniedException("Outside department");
    }
}
