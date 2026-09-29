package com.company.erp.config;
import com.company.erp.enums.Role;
import com.company.erp.model.entity.*;
import com.company.erp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
@Component
@Profile("local")
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class LocalDataInitializer implements CommandLineRunner {
    private final DepartmentRepository departments;
    private final UserRepository users;
    private final ProductRepository products;
    private final PasswordEncoder encoder;
    private final String password;
    public LocalDataInitializer(DepartmentRepository departments, UserRepository users, ProductRepository products, PasswordEncoder encoder, @Value("${app.seed.password}") String password) {
        this.departments = departments; this.users = users; this.products = products; this.encoder = encoder; this.password = password;
    }
    @Override @Transactional
    public void run(String... args) {
        if (departments.count() == 0) {
            var names = new LinkedHashMap<String, String>();
            names.put("IT", "เทคโนโลยีสารสนเทศ"); names.put("HR", "ทรัพยากรบุคคล"); names.put("ACCOUNTING", "บัญชี");
            names.put("FINANCE", "การเงิน"); names.put("PROCUREMENT", "จัดซื้อ"); names.put("WAREHOUSE", "คลังสินค้า"); names.put("SALES", "ฝ่ายขาย");
            names.forEach((code, name) -> { var d = new Department(); d.setCode(code); d.setName(name); departments.save(d); });
        }
        if (users.count() == 0) {
            var it = departments.findAll().stream().filter(d -> d.getCode().equals("IT")).findFirst().orElseThrow();
            var hr = departments.findAll().stream().filter(d -> d.getCode().equals("HR")).findFirst().orElseThrow();
            createUser("admin", "ผู้ดูแลระบบ", Role.ADMIN, it);
            createUser("employee.it", "พนักงาน IT", Role.EMPLOYEE, it);
            createUser("manager.it", "หัวหน้า IT", Role.MANAGER, it);
            createUser("employee.hr", "พนักงาน HR", Role.EMPLOYEE, hr);
            createUser("manager.hr", "หัวหน้า HR", Role.MANAGER, hr);
        }
        if (products.count() == 0) {
            createProduct("NB-001", "Notebook สำหรับสำนักงาน", "เครื่อง", "25000.00");
            createProduct("MON-001", "จอภาพ 24 นิ้ว", "จอ", "4500.00");
            createProduct("PAPER-A4", "กระดาษ A4", "รีม", "120.00");
        }
    }
    private void createUser(String username, String name, Role role, Department department) {
        var u = new User(); u.setUsername(username); u.setDisplayName(name); u.setRole(role); u.setDepartment(department); u.setPasswordHash(encoder.encode(password)); users.save(u);
    }
    private void createProduct(String sku, String name, String unit, String price) {
        var p = new Product(); p.setSku(sku); p.setName(name); p.setUnit(unit); p.setPrice(new BigDecimal(price)); products.save(p);
    }
}
