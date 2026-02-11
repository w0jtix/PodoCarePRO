package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductCategoryRepo extends JpaRepository<ProductCategory, Long> {

    @Query("SELECT pc FROM ProductCategory pc WHERE LOWER(TRIM(pc.name)) = LOWER(TRIM(:name))")
    Optional<ProductCategory> findByCategoryName(String name);
}
