package com.pasindu.ecommerce_backend.controller;
import com.pasindu.ecommerce_backend.entity.*;
import com.pasindu.ecommerce_backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistRepository wishlists;
    private final UserRepository users;
    private final ProductRepository products;
    public WishlistController(WishlistRepository wishlists, UserRepository users, ProductRepository products) {
        this.wishlists = wishlists; this.users = users; this.products = products;
    }
    @GetMapping
    public List<Map<String,Object>> list(Authentication auth) {
        User user = currentUser(auth);
        return wishlists.findByUserOrderByIdDesc(user).stream().map(item -> toMap(item.getProduct())).toList();
    }
    @PostMapping
    public ResponseEntity<?> add(@RequestBody Map<String,Object> body, Authentication auth) {
        Long productId;
        try { productId = Long.valueOf(String.valueOf(body.get("productId"))); }
        catch (Exception ex) { return ResponseEntity.badRequest().body(Map.of("message", "A valid productId is required.")); }
        User user = currentUser(auth);
        Product product = products.findById(productId).orElse(null);
        if (product == null || !product.isActive()) return ResponseEntity.notFound().build();
        if (wishlists.findByUserIdAndProductId(user.getId(), productId).isEmpty()) wishlists.save(new WishlistItem(user, product));
        return ResponseEntity.ok(toMap(product));
    }
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@PathVariable Long productId, Authentication auth) {
        User user = currentUser(auth);
        wishlists.findByUserIdAndProductId(user.getId(), productId).ifPresent(wishlists::delete);
        return ResponseEntity.noContent().build();
    }
    private User currentUser(Authentication auth) { return users.findByEmail(auth.getName()).orElseThrow(); }
    private Map<String,Object> toMap(Product product) {
        Map<String,Object> map = new LinkedHashMap<>();
        map.put("id", product.getId()); map.put("name", product.getName()); map.put("description", product.getDescription());
        map.put("price", product.getPrice()); map.put("stockQuantity", product.getStockQuantity());
        map.put("imageUrl", product.getImageUrl()); map.put("category", product.getCategory());
        return map;
    }
}
