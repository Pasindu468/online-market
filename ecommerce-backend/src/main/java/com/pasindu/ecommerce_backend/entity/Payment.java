package com.pasindu.ecommerce_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One payment belongs to one order
    @OneToOne
    @JoinColumn(
            name = "order_id",
            nullable = false,
            unique = true
    )
    private Order order;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private LocalDateTime paymentDate;


    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public Payment() {
    }


    public Payment(
            Order order,
            Double amount,
            String paymentMethod) {

        this.order = order;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = PaymentStatus.PENDING;
        this.paymentDate = LocalDateTime.now();
    }


    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }


    public Order getOrder() {
        return order;
    }


    public void setOrder(Order order) {
        this.order = order;
    }


    public Double getAmount() {
        return amount;
    }


    public void setAmount(Double amount) {
        this.amount = amount;
    }


    public PaymentStatus getStatus() {
        return status;
    }


    public void setStatus(PaymentStatus status) {
        this.status = status;
    }


    public String getPaymentMethod() {
        return paymentMethod;
    }


    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }


    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }


    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
}