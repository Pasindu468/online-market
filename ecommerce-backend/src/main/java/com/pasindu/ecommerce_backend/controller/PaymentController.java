package com.pasindu.ecommerce_backend.controller;

import com.pasindu.ecommerce_backend.entity.Order;
import com.pasindu.ecommerce_backend.entity.Payment;
import com.pasindu.ecommerce_backend.entity.PaymentStatus;
import com.pasindu.ecommerce_backend.entity.User;

import com.pasindu.ecommerce_backend.repository.OrderRepository;
import com.pasindu.ecommerce_backend.repository.PaymentRepository;
import com.pasindu.ecommerce_backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentController(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // MAKE PAYMENT
    // =========================================================

    @PostMapping("/pay/{orderId}")
    public ResponseEntity<?> makePayment(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        // Get logged-in user's email
        String email = authentication.getName();

        // Find user
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));


        // Find order
        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));


        // =====================================================
        // SECURITY CHECK
        // =====================================================

        if (!order.getUser().getId().equals(user.getId())) {

            return ResponseEntity
                    .status(403)
                    .body(
                            "You cannot pay for another user's order"
                    );
        }


        // =====================================================
        // CHECK IF ORDER IS CANCELLED
        // =====================================================

        if (order.getStatus().toString()
                .equals("CANCELLED")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Cannot pay for a cancelled order"
                    );
        }


        // =====================================================
        // CHECK EXISTING PAYMENT
        // =====================================================

        if (paymentRepository
                .findByOrder(order)
                .isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Payment already exists for this order"
                    );
        }


        // =====================================================
        // GET PAYMENT METHOD
        // =====================================================

        String paymentMethod =
                request.get("paymentMethod");


        if (paymentMethod == null ||
                paymentMethod.isBlank()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Payment method is required"
                    );
        }


        // =====================================================
        // CREATE PAYMENT
        // =====================================================

        Payment payment =
                new Payment(
                        order,
                        order.getTotalAmount(),
                        paymentMethod
                );


        // For our portfolio project,
        // we simulate a successful payment.
        payment.setStatus(
                PaymentStatus.SUCCESS
        );


        Payment savedPayment =
                paymentRepository.save(payment);


        // =====================================================
        // UPDATE ORDER STATUS
        // =====================================================

        order.setStatus(
                com.pasindu.ecommerce_backend.entity.OrderStatus.CONFIRMED
        );

        orderRepository.save(order);


        // =====================================================
        // RESPONSE
        // =====================================================

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "Payment successful"
        );

        response.put(
                "paymentId",
                savedPayment.getId()
        );

        response.put(
                "orderId",
                order.getId()
        );

        response.put(
                "amount",
                savedPayment.getAmount()
        );

        response.put(
                "paymentMethod",
                savedPayment.getPaymentMethod()
        );

        response.put(
                "paymentStatus",
                savedPayment.getStatus()
        );

        response.put(
                "orderStatus",
                order.getStatus()
        );

        response.put(
                "paymentDate",
                savedPayment.getPaymentDate()
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET MY PAYMENT
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPayment(
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
                            "You cannot view another user's payment"
                    );
        }


        Payment payment =
                paymentRepository
                        .findByOrder(order)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                ));


        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "paymentId",
                payment.getId()
        );

        response.put(
                "orderId",
                order.getId()
        );

        response.put(
                "amount",
                payment.getAmount()
        );

        response.put(
                "paymentMethod",
                payment.getPaymentMethod()
        );

        response.put(
                "paymentStatus",
                payment.getStatus()
        );

        response.put(
                "paymentDate",
                payment.getPaymentDate()
        );

        return ResponseEntity.ok(response);
    }
}