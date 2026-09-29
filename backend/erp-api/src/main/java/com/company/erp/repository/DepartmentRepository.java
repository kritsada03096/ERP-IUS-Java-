package com.company.erp.repository;
import com.company.erp.model.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByCode(String code);
}
