package com.pasindu.ecommerce_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_reviews", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "user_id"}))
public class ProductReview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "product_id")
    private Product product;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id")
    private User user;
    @Column(nullable = false)
    private Integer rating;
    @Column(nullable = false, length = 1000)
    private String comment;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    protected ProductReview() {}
    public ProductReview(Product product, User user, Integer rating, String comment) {
        this.product = product; this.user = user; this.rating = rating; this.comment = comment;
    }
    public Long getId() { return id; }
    public Product getProduct() { return product; }
    public User getUser() { return user; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
