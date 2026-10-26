
package com.pasindu.ecommerce_backend.controller;

import com.pasindu.ecommerce_backend.entity.Product;
import com.pasindu.ecommerce_backend.repository.ProductRepository;
import com.pasindu.ecommerce_backend.service.FileStorageService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;

    public ProductController(
            ProductRepository productRepository,
            FileStorageService fileStorageService) {

        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
    }

    // GET ALL PRODUCTS
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    // GET PRODUCT BY ID
    @GetMapping("/{id}")
    public Optional<Product> getProductById(
            @PathVariable Long id) {

        return productRepository.findById(id).filter(Product::isActive);
    }

    // CREATE PRODUCT
    @PostMapping
    public Product createProduct(
            @RequestBody Product product) {

        product.setActive(true);
        return productRepository.save(product);
    }

    // UPDATE PRODUCT
    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product productDetails) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setStockQuantity(productDetails.getStockQuantity());

        // Preserve the existing image if no new URL is supplied.
        if (productDetails.getImageUrl() != null
                && !productDetails.getImageUrl().isBlank()) {
            product.setImageUrl(productDetails.getImageUrl());
        }

        product.setCategory(productDetails.getCategory());

        return productRepository.save(product);
    }

    // UPLOAD PRODUCT IMAGE
    @PostMapping(
            value = "/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        try {
            Product product = productRepository
                    .findById(id)
                    .orElseThrow(() ->
                            new RuntimeException("Product not found"));

            String imageUrl = fileStorageService.saveImage(file);

            product.setImageUrl(imageUrl);
            productRepository.save(product);

            return ResponseEntity.ok(Map.of(
                    "message", "Product image uploaded successfully",
                    "imageUrl", imageUrl
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));

        } catch (RuntimeException e) {
            if ("Product not found".equals(e.getMessage())) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.internalServerError().body(
                    Map.of("message", "Unable to upload product image."));
        }
    }

    // REMOVE PRODUCT FROM THE STORE WHILE PRESERVING ORDER HISTORY
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product == null || !product.isActive()) {
            return ResponseEntity.notFound().build();
        }
        product.setActive(false);
        productRepository.save(product);
        return ResponseEntity.ok(Map.of("message", "Product removed from the store."));
    }
}
