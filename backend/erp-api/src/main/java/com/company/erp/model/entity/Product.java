package com.company.erp.model.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.company.erp.enums.*;
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 40)
    private String sku;
    @Column(nullable = false, length = 160)
    private String name;
    @Column(nullable = false, length = 30)
    private String unit;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal price;
    @Column(nullable = false)
    private boolean active = true;
    public Long getId() { return id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public boolean getActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
