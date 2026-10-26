package com.pasindu.ecommerce_backend.entity;
import jakarta.persistence.*;
@Entity
@Table(name = "wishlists", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"}))
public class WishlistItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(optional = false) @JoinColumn(name = "product_id") private Product product;
    protected WishlistItem() {}
    public WishlistItem(User user, Product product) { this.user = user; this.product = product; }
    public Long getId() { return id; }
    public Product getProduct() { return product; }
}
