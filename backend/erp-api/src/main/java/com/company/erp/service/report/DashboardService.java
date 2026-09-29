package com.company.erp.service.report;
import com.company.erp.enums.PurchaseRequestStatus;
import com.company.erp.model.response.DashboardResponse;
import com.company.erp.repository.*;
import com.company.erp.service.procurement.PurchaseRequestService;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@Transactional(readOnly = true)
public class DashboardService {
    private final DepartmentRepository departments;
    private final ProductRepository products;
    private final PurchaseRequestService purchases;
    public DashboardService(DepartmentRepository departments, ProductRepository products, PurchaseRequestService purchases) { this.departments = departments; this.products = products; this.purchases = purchases; }
    public DashboardResponse summary() {
        var visible = purchases.list();
        return new DashboardResponse(departments.count(), products.findAll().stream().filter(p -> p.getActive()).count(), visible.size(),
            visible.stream().filter(p -> p.status() == PurchaseRequestStatus.PENDING_APPROVAL).count(),
            visible.stream().filter(p -> p.status() == PurchaseRequestStatus.APPROVED).map(p -> p.total()).reduce(BigDecimal.ZERO, BigDecimal::add));
    }
}
