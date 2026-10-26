package com.pasindu.ecommerce_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(length = 1000)
    private String description;

    @Column
    private String imageUrl;

    @Column(nullable = false, columnDefinition = "TINYINT(1) NOT NULL DEFAULT 1")
    private boolean active = true;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // ==============================
    // Constructors
    // ==============================

    public Product() {
    }

    public Product(
            String name,
            Double price,
            Integer stockQuantity,
            String description,
            String imageUrl,
            Category category) {

        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.description = description;
        this.imageUrl = imageUrl;
        this.category = category;
    }

    // ==============================
    // Getters and Setters
    // ==============================

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isActive() { return active; }

    public void setActive(boolean active) { this.active = active; }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}