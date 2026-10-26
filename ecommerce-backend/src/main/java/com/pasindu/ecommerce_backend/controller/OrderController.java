package com.pasindu.ecommerce_backend.controller;

import com.pasindu.ecommerce_backend.entity.Cart;
import com.pasindu.ecommerce_backend.entity.CartItem;
import com.pasindu.ecommerce_backend.entity.Order;
import com.pasindu.ecommerce_backend.entity.OrderItem;
import com.pasindu.ecommerce_backend.entity.OrderStatus;
import com.pasindu.ecommerce_backend.entity.Product;
import com.pasindu.ecommerce_backend.entity.User;

import com.pasindu.ecommerce_backend.repository.CartRepository;
import com.pasindu.ecommerce_backend.repository.OrderItemRepository;
import com.pasindu.ecommerce_backend.repository.OrderRepository;
import com.pasindu.ecommerce_backend.repository.ProductRepository;
import com.pasindu.ecommerce_backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderController(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }


    // =========================================================
    // CHECKOUT
    // =========================================================

    @Transactional
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            Authentication authentication) {

        String email = authentication.getName();

        // Find logged-in user
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find user's cart
        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        // Check whether cart is empty
        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Your cart is empty");
        }


        // =====================================================
        // CHECK STOCK BEFORE CREATING ORDER
        // =====================================================

        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            if (!product.isActive()) {
                return ResponseEntity.badRequest().body(Map.of("message", product.getName() + " is no longer available."));
            }

            Integer availableStock =
                    product.getStockQuantity();

            Integer requestedQuantity =
                    cartItem.getQuantity();

            if (availableStock == null ||
                    availableStock < requestedQuantity) {

                Map<String, Object> error =
                        new HashMap<>();

                error.put(
                        "message",
                        "Insufficient stock"
                );

                error.put(
                        "productId",
                        product.getId()
                );

                error.put(
                        "productName",
                        product.getName()
                );

                error.put(
                        "availableStock",
                        availableStock
                );

                error.put(
                        "requestedQuantity",
                        requestedQuantity
                );

                return ResponseEntity
                        .badRequest()
                        .body(error);
            }
        }


        // =====================================================
        // CALCULATE TOTAL
        // =====================================================

        double total = 0;

        for (CartItem cartItem : cart.getItems()) {

            double subtotal =
                    cartItem.getProduct().getPrice()
                            * cartItem.getQuantity();

            total += subtotal;
        }


        // =====================================================
        // CREATE ORDER
        // =====================================================

        Order order = new Order(
                user,
                total
        );

        order = orderRepository.save(order);


        // =====================================================
        // CREATE ORDER ITEMS + REDUCE STOCK
        // =====================================================

        List<Map<String, Object>> responseItems =
                new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {

            Product product =
                    cartItem.getProduct();

            double productPrice =
                    product.getPrice();

            int quantity =
                    cartItem.getQuantity();


            // Create order item
            OrderItem orderItem =
                    new OrderItem(
                            order,
                            product,
                            quantity,
                            productPrice
                    );

            orderItemRepository.save(orderItem);


            // Reduce product stock
            product.setStockQuantity(
                    product.getStockQuantity()
                            - quantity
            );

            productRepository.save(product);


            // Response item
            Map<String, Object> item =
                    new HashMap<>();

            item.put(
                    "productId",
                    product.getId()
            );

            item.put(
                    "productName",
                    product.getName()
            );

            item.put(
                    "quantity",
                    quantity
            );

            item.put(
                    "price",
                    productPrice
            );

            item.put(
                    "subtotal",
                    productPrice * quantity
            );

            item.put(
                    "remainingStock",
                    product.getStockQuantity()
            );

            responseItems.add(item);
        }


        // =====================================================
        // CLEAR CART
        // =====================================================

        cart.getItems().clear();

        cartRepository.save(cart);


        // =====================================================
        // RESPONSE
        // =====================================================

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "Order placed successfully"
        );

        response.put(
                "orderId",
                order.getId()
        );

        response.put(
                "totalAmount",
                total
        );

        response.put(
                "status",
                order.getStatus()
        );

        response.put(
                "orderDate",
                order.getOrderDate()
        );

        response.put(
                "items",
                responseItems
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET MY ORDERS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getMyOrders(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Order> orders =
                orderRepository
                        .findByUserOrderByOrderDateDesc(user);

        List<Map<String, Object>> response =
                new ArrayList<>();

        for (Order order : orders) {

            Map<String, Object> orderData =
                    new HashMap<>();

            orderData.put(
                    "orderId",
                    order.getId()
            );

            orderData.put(
                    "totalAmount",
                    order.getTotalAmount()
            );

            orderData.put(
                    "status",
                    order.getStatus()
            );

            orderData.put(
                    "orderDate",
                    order.getOrderDate()
            );

            response.add(orderData);
        }

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET SINGLE ORDER
    // =========================================================

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));


        // Security check
        if (!order.getUser().getId().equals(user.getId())) {

            return ResponseEntity
                    .status(403)
                    .body(
                            "You cannot view another user's order"
                    );
        }


        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "orderId",
                order.getId()
        );

        response.put(
                "totalAmount",
                order.getTotalAmount()
        );

        response.put(
                "status",
                order.getStatus()
        );

        response.put(
                "orderDate",
                order.getOrderDate()
        );


        // Order items
        List<Map<String, Object>> items =
                new ArrayList<>();

        for (OrderItem item : order.getItems()) {

            Map<String, Object> itemData =
                    new HashMap<>();

            itemData.put(
                    "orderItemId",
                    item.getId()
            );

            itemData.put(
                    "productId",
                    item.getProduct().getId()
            );

            itemData.put(
                    "productName",
                    item.getProduct().getName()
            );

            itemData.put(
                    "price",
                    item.getPrice()
            );

            itemData.put(
                    "quantity",
                    item.getQuantity()
            );

            itemData.put(
                    "subtotal",
                    item.getPrice()
                            * item.getQuantity()
            );

            items.add(itemData);
        }

        response.put(
                "items",
                items
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // ADMIN - GET ALL ORDERS
    // =========================================================

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllOrdersForAdmin() {

        List<Order> orders =
                orderRepository
                        .findAllByOrderByOrderDateDesc();

        List<Map<String, Object>> response =
                new ArrayList<>();

        for (Order order : orders) {

            Map<String, Object> orderData =
                    new HashMap<>();

            orderData.put(
                    "orderId",
                    order.getId()
            );

            orderData.put(
                    "customerId",
                    order.getUser().getId()
            );

            orderData.put(
                    "customerName",
                    order.getUser().getName()
            );

            orderData.put(
                    "customerEmail",
                    order.getUser().getEmail()
            );

            orderData.put(
                    "totalAmount",
                    order.getTotalAmount()
            );

            orderData.put(
                    "status",
                    order.getStatus()
            );

            orderData.put(
                    "orderDate",
                    order.getOrderDate()
            );

            response.add(orderData);
        }

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // ADMIN - UPDATE ORDER STATUS
    // =========================================================

    @PutMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {

        // Find order
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));


        // Get status from request
        String statusValue =
                request.get("status");


        // Check status
        if (statusValue == null ||
                statusValue.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Status is required"
                    );
        }


        // Convert String to OrderStatus enum
        OrderStatus newStatus;

        try {

            newStatus =
                    OrderStatus.valueOf(
                            statusValue.toUpperCase()
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid status. Please use: " +
                            "PENDING, CONFIRMED, SHIPPED, " +
                            "DELIVERED, CANCELLED"
                    );
        }


        // Update order status
        order.setStatus(newStatus);


        // Save updated order
        Order updatedOrder =
                orderRepository.save(order);


        // Create response
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "Order status updated successfully"
        );

        response.put(
                "orderId",
                updatedOrder.getId()
        );

        response.put(
                "status",
                updatedOrder.getStatus()
        );

        response.put(
                "totalAmount",
                updatedOrder.getTotalAmount()
        );

        response.put(
                "orderDate",
                updatedOrder.getOrderDate()
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
// ADMIN - CANCEL ORDER AND RESTORE STOCK
// =========================================================

@PutMapping("/admin/{orderId}/cancel")
public ResponseEntity<?> cancelOrder(
        @PathVariable Long orderId) {

    // Find order
    Order order = orderRepository
            .findById(orderId)
            .orElseThrow(() ->
                    new RuntimeException("Order not found"));


    // Check if already cancelled
    if (order.getStatus() == OrderStatus.CANCELLED) {

        return ResponseEntity
                .badRequest()
                .body("Order is already cancelled");
    }


    // Restore product stock
    List<Map<String, Object>> restoredItems =
            new ArrayList<>();

    for (OrderItem orderItem : order.getItems()) {

        Product product =
                orderItem.getProduct();

        int quantity =
                orderItem.getQuantity();

        // Current stock
        int currentStock =
                product.getStockQuantity();

        // Restore stock
        product.setStockQuantity(
                currentStock + quantity
        );

        productRepository.save(product);


        // Response information
        Map<String, Object> item =
                new HashMap<>();

        item.put(
                "productId",
                product.getId()
        );

        item.put(
                "productName",
                product.getName()
        );

        item.put(
                "restoredQuantity",
                quantity
        );

        item.put(
                "newStock",
                product.getStockQuantity()
        );

        restoredItems.add(item);
    }


    // Change order status
    order.setStatus(OrderStatus.CANCELLED);

    Order cancelledOrder =
            orderRepository.save(order);


    // Response
    Map<String, Object> response =
            new HashMap<>();

    response.put(
            "message",
            "Order cancelled and stock restored successfully"
    );

    response.put(
            "orderId",
            cancelledOrder.getId()
    );

    response.put(
            "status",
            cancelledOrder.getStatus()
    );

    response.put(
            "totalAmount",
            cancelledOrder.getTotalAmount()
    );

    response.put(
            "orderDate",
            cancelledOrder.getOrderDate()
    );

    response.put(
            "restoredItems",
            restoredItems
    );

    return ResponseEntity.ok(response);
        }
}