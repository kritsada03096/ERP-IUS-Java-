package com.company.erp.service.master;
import com.company.erp.model.entity.Product;
import com.company.erp.model.request.ProductRequest;
import com.company.erp.model.response.ProductResponse;
import com.company.erp.repository.ProductRepository;
import com.company.erp.mapper.ErpMapper;
import com.company.erp.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository repository;
    public ProductService(ProductRepository repository) { this.repository = repository; }
    public List<ProductResponse> list() { return repository.findAll(org.springframework.data.domain.Sort.by("sku")).stream().map(ErpMapper::product).toList(); }
    public ProductResponse get(Long id) { return ErpMapper.product(find(id)); }
    private Product find(Long id) { return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("ไม่พบสินค้า")); }
    @Transactional
    public ProductResponse create(ProductRequest request) {
        if (repository.existsBySku(request.sku())) throw new BusinessException("รหัสสินค้าซ้ำ");
        Product p = new Product(); copy(request, p); return ErpMapper.product(repository.save(p));
    }
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product p = find(id);
        if (repository.existsBySkuAndIdNot(request.sku(), id)) throw new BusinessException("รหัสสินค้าซ้ำ");
        copy(request, p); return ErpMapper.product(p);
    }
    @Transactional
    public void deactivate(Long id) { find(id).setActive(false); }
    private void copy(ProductRequest r, Product p) { p.setSku(r.sku()); p.setName(r.name().trim()); p.setUnit(r.unit().trim()); p.setPrice(r.price()); }
}
