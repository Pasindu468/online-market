package com.pasindu.ecommerce_backend.repository;

import com.pasindu.ecommerce_backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

}