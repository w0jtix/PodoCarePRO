package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Product;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE "
            + "(COALESCE(:categories, NULL) IS NULL OR p.category IN :categories) "
            + "AND (COALESCE(:brandIds, NULL) IS NULL OR p.brand.id IN :brandIds) "
            + "AND (COALESCE(:keyword, '') = '' OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "AND (COALESCE(:available, NULL) IS NULL OR p.isDeleted = :available)")
    List<Product> findAllWithFilters(
            @Param("categories") List<String> categories,
            @Param("brandIds") List<Long> brandIds,
            @Param("keyword") String keyword,
            @Param("available") Boolean available
    );

    @Query("SELECT p FROM Product p WHERE LOWER(TRIM(p.productName)) = LOWER(TRIM(:productName))")
    Optional<Product> findByProductName(String productName);
}
