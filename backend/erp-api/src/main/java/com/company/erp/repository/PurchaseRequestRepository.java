package com.company.erp.repository;
import com.company.erp.model.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from PurchaseRequest p where p.id = :id")
    java.util.Optional<PurchaseRequest> findForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
    java.util.List<PurchaseRequest> findByRequesterIdOrderByCreatedAtDesc(Long id);
    java.util.List<PurchaseRequest> findByDepartmentIdOrderByCreatedAtDesc(Long id);
    java.util.List<PurchaseRequest> findAllByOrderByCreatedAtDesc();
}
