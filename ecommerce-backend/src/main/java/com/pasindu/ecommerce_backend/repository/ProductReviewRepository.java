package com.pasindu.ecommerce_backend.repository;
import com.pasindu.ecommerce_backend.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);
    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
