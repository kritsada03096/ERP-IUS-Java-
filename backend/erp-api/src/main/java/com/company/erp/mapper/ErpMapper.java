package com.company.erp.mapper;
import com.company.erp.model.entity.*;
import com.company.erp.model.response.*;
import com.company.erp.model.dto.PurchaseItemDto;
import java.util.List;
public final class ErpMapper {
    private ErpMapper() {}
    public static DepartmentResponse department(Department d) { return new DepartmentResponse(d.getId(), d.getCode(), d.getName()); }
    public static ProductResponse product(Product p) { return new ProductResponse(p.getId(), p.getSku(), p.getName(), p.getUnit(), p.getPrice(), p.getActive()); }
    public static UserResponse user(User u) { return new UserResponse(u.getId(), u.getUsername(), u.getDisplayName(), u.getRole(), u.getDepartment().getId(), u.getDepartment().getName()); }
    public static PurchaseRequestResponse purchase(PurchaseRequest p, List<ApprovalEvent> history) {
        return new PurchaseRequestResponse(p.getId(), p.getNumber(), p.getRequester().getId(), p.getRequester().getDisplayName(), p.getDepartment().getId(), p.getDepartment().getName(), p.getReason(), p.getStatus(), p.getTotal(), p.getCreatedAt(),
            p.getItems().stream().map(i -> new PurchaseItemDto(i.getProduct().getId(), i.getProductName(), i.getUnit(), i.getQuantity(), i.getUnitPrice(), i.getLineTotal())).toList(),
            history.stream().map(a -> new ApprovalEventResponse(a.getId(), a.getAction(), a.getActor().getDisplayName(), a.getComment(), a.getCreatedAt())).toList());
    }
}
