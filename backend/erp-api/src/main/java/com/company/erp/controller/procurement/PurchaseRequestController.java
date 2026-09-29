package com.company.erp.controller.procurement;
import com.company.erp.service.procurement.PurchaseRequestService;
import com.company.erp.model.request.*;
import com.company.erp.model.response.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/v1/purchase-requests")
public class PurchaseRequestController {
    private final PurchaseRequestService service;
    public PurchaseRequestController(PurchaseRequestService service) { this.service = service; }

    @GetMapping public List<PurchaseRequestResponse> list() { return service.list(); }
    @GetMapping("/{id}") public PurchaseRequestResponse get(@PathVariable Long id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public PurchaseRequestResponse create(@Valid @RequestBody CreatePurchaseRequest request) { return service.create(request); }
    @PostMapping("/{id}/submit")
    public PurchaseRequestResponse submit(@PathVariable Long id) { return service.submit(id); }
}
