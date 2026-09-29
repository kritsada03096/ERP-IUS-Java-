package com.company.erp.service.master;
import com.company.erp.model.entity.Department;
import com.company.erp.model.request.DepartmentRequest;
import com.company.erp.model.response.DepartmentResponse;
import com.company.erp.repository.DepartmentRepository;
import com.company.erp.mapper.ErpMapper;
import com.company.erp.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@Transactional(readOnly = true)
public class DepartmentService {
    private final DepartmentRepository repository;
    public DepartmentService(DepartmentRepository repository) { this.repository = repository; }
    public List<DepartmentResponse> list() { return repository.findAll(org.springframework.data.domain.Sort.by("code")).stream().map(ErpMapper::department).toList(); }
    @Transactional
    public DepartmentResponse create(DepartmentRequest request) {
        if (repository.existsByCode(request.code())) throw new BusinessException("รหัสแผนกซ้ำ");
        Department d = new Department(); d.setCode(request.code()); d.setName(request.name().trim());
        return ErpMapper.department(repository.save(d));
    }
}
