package com.company.erp.repository;
import com.company.erp.model.entity.ApprovalEvent;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ApprovalEventRepository extends JpaRepository<ApprovalEvent, Long> {
    java.util.List<ApprovalEvent> findByPurchaseRequestIdOrderByCreatedAtAscIdAsc(Long id);
}
