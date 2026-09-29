package com.company.erp.model.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.company.erp.enums.*;
@Entity
@Table(name = "approval_events")
public class ApprovalEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private PurchaseRequest purchaseRequest;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User actor;
    @Column(nullable = false, length = 30)
    private String action;
    @Column(nullable = false, length = 1000)
    private String comment;
    @Column(nullable = false)
    private Instant createdAt;
    public Long getId() { return id; }
    public PurchaseRequest getPurchaseRequest() { return purchaseRequest; }
    public void setPurchaseRequest(PurchaseRequest purchaseRequest) { this.purchaseRequest = purchaseRequest; }
    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
