package com.pasindu.ecommerce_backend.controller;

import com.pasindu.ecommerce_backend.entity.*;
import com.pasindu.ecommerce_backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ProductReviewController {
    private final ProductReviewRepository reviews;
    private final ProductRepository products;
    private final UserRepository users;
    public ProductReviewController(ProductReviewRepository reviews, ProductRepository products, UserRepository users) {
        this.reviews = reviews; this.products = products; this.users = users;
    }
    @GetMapping
    public List<Map<String, Object>> list(@PathVariable Long productId) {
        return reviews.findByProductIdOrderByCreatedAtDesc(productId).stream().map(this::toMap).toList();
    }
    @PostMapping
    public ResponseEntity<?> create(@PathVariable Long productId, @RequestBody Map<String, Object> body, Authentication auth) {
        Product product = products.findById(productId).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();
        User user = users.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();
        Object rawRating = body.get("rating");
        int rating;
        try { rating = Integer.parseInt(String.valueOf(rawRating)); }
        catch (Exception ex) { return ResponseEntity.badRequest().body(Map.of("message", "Rating must be between 1 and 5.")); }
        String comment = Objects.toString(body.get("comment"), "").trim();
        if (rating < 1 || rating > 5 || comment.isBlank() || comment.length() > 1000)
            return ResponseEntity.badRequest().body(Map.of("message", "Enter a rating from 1 to 5 and a comment under 1000 characters."));
        if (reviews.existsByProductIdAndUserId(productId, user.getId()))
            return ResponseEntity.status(409).body(Map.of("message", "You have already reviewed this product."));
        return ResponseEntity.ok(toMap(reviews.save(new ProductReview(product, user, rating, comment))));
    }
    private Map<String, Object> toMap(ProductReview review) {
        return Map.of("id", review.getId(), "rating", review.getRating(), "comment", review.getComment(),
                "createdAt", review.getCreatedAt(), "userName", review.getUser().getName());
    }
}
