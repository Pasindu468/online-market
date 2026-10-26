package com.pasindu.ecommerce_backend.repository;

import com.pasindu.ecommerce_backend.entity.Payment;
import com.pasindu.ecommerce_backend.entity.Order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder(Order order);
}