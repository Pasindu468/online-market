package com.pasindu.ecommerce_backend.repository;

import com.pasindu.ecommerce_backend.entity.Order;
import com.pasindu.ecommerce_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByOrderDateDesc(User user);

    List<Order> findAllByOrderByOrderDateDesc();
}