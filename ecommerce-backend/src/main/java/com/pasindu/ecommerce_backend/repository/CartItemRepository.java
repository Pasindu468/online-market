package com.pasindu.ecommerce_backend.repository;

import com.pasindu.ecommerce_backend.entity.Cart;
import com.pasindu.ecommerce_backend.entity.CartItem;
import com.pasindu.ecommerce_backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(
            Cart cart,
            Product product
    );
}