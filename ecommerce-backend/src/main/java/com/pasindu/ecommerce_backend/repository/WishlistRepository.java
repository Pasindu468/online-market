package com.pasindu.ecommerce_backend.repository;
import com.pasindu.ecommerce_backend.entity.WishlistItem;
import com.pasindu.ecommerce_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserOrderByIdDesc(User user);
    Optional<WishlistItem> findByUserIdAndProductId(Long userId, Long productId);
}
