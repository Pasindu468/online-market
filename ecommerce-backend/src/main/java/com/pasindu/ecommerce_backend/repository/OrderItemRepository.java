package com.pasindu.ecommerce_backend.repository;

import com.pasindu.ecommerce_backend.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {
}