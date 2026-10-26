package com.pasindu.ecommerce_backend.controller;

import com.pasindu.ecommerce_backend.entity.Cart;
import com.pasindu.ecommerce_backend.entity.CartItem;
import com.pasindu.ecommerce_backend.entity.Product;
import com.pasindu.ecommerce_backend.entity.User;
import com.pasindu.ecommerce_backend.repository.CartItemRepository;
import com.pasindu.ecommerce_backend.repository.CartRepository;
import com.pasindu.ecommerce_backend.repository.ProductRepository;
import com.pasindu.ecommerce_backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartController(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET CART
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getCart(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Cart cart = cartRepository
                .findByUser(user)
                .orElseGet(() -> {

                    Cart newCart = new Cart(user);

                    return cartRepository.save(newCart);
                });

        Map<String, Object> response = new HashMap<>();

        response.put("cartId", cart.getId());

        List<Map<String, Object>> items = new ArrayList<>();

        double total = 0;

        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            double subtotal =
                    product.getPrice() *
                    cartItem.getQuantity();

            Map<String, Object> item = new HashMap<>();

            item.put(
                    "cartItemId",
                    cartItem.getId()
            );

            item.put(
                    "productId",
                    product.getId()
            );

            item.put(
                    "productName",
                    product.getName()
            );
            item.put("imageUrl", product.getImageUrl());

            item.put(
                    "price",
                    product.getPrice()
            );

            item.put(
                    "quantity",
                    cartItem.getQuantity()
            );

            item.put(
                    "subtotal",
                    subtotal
            );

            items.add(item);

            total += subtotal;
        }

        response.put("items", items);
        response.put("total", total);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // ADD PRODUCT TO CART
    // =========================================================

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {

        // Check quantity
        if (quantity <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Quantity must be greater than 0");
        }

        // Get logged-in user's email
        String email = authentication.getName();

        // Find user
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find product
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        if (!product.isActive()) {
            return ResponseEntity.badRequest().body("This product is no longer available.");
        }

        if (product.getStockQuantity() == null || quantity > product.getStockQuantity()) {
            return ResponseEntity.badRequest().body("Requested quantity exceeds available stock");
        }


        // Find user's cart or create a new one
        Cart cart = cartRepository
                .findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(
                                new Cart(user)
                        )
                );

        // Check whether product already exists in cart
        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        if (cartItem != null && cartItem.getQuantity() + quantity > product.getStockQuantity()) {
            return ResponseEntity.badRequest().body("Requested quantity exceeds available stock");
        }

        if (cartItem != null) {

            // Product already exists
            // Increase quantity

            cartItem.setQuantity(
                    cartItem.getQuantity() + quantity
            );

        } else {

            // Product doesn't exist
            // Create new cart item

            cartItem = new CartItem(
                    cart,
                    product,
                    quantity
            );
        }

        // Save cart item
        cartItemRepository.save(cartItem);

        // Create response
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "Product added to cart"
        );

        response.put(
                "productId",
                productId
        );

        response.put(
                "quantity",
                cartItem.getQuantity()
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE CART ITEM QUANTITY
    // =========================================================

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity,
            Authentication authentication) {

        // Check quantity
        if (quantity <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body("Quantity must be greater than 0");
        }

        // Get logged-in user's email
        String email = authentication.getName();

        // Find user
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find user's cart
        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        // Find cart item
        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart item not found"
                        ));

        // Security check:
        // Make sure this cart item belongs
        // to the logged-in user's cart
        if (!cartItem
                .getCart()
                .getId()
                .equals(cart.getId())) {

            return ResponseEntity
                    .status(403)
                    .body(
                            "You cannot update another user's cart item"
                    );
        }

        if (cartItem.getProduct().getStockQuantity() == null || quantity > cartItem.getProduct().getStockQuantity()) {
            return ResponseEntity.badRequest().body("Requested quantity exceeds available stock");
        }

        // Update quantity
        cartItem.setQuantity(quantity);

        // Save
        cartItemRepository.save(cartItem);

        // Response
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "Cart quantity updated"
        );

        response.put(
                "cartItemId",
                cartItemId
        );

        response.put(
                "quantity",
                quantity
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // REMOVE PRODUCT FROM CART
    // =========================================================

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {

        // Get logged-in user's email
        String email = authentication.getName();

        // Find user
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find user's cart
        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        // Find cart item
        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart item not found"
                        ));

        // Security check:
        // Make sure the item belongs to this user's cart
        if (!cartItem
                .getCart()
                .getId()
                .equals(cart.getId())) {

            return ResponseEntity
                    .status(403)
                    .body(
                            "You cannot remove another user's cart item"
                    );
        }

        // Delete cart item
        cartItemRepository.delete(cartItem);

        return ResponseEntity.ok(
                "Product removed from cart"
        );
    }
}