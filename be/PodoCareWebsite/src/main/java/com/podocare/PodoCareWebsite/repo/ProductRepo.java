package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"category", "brand"})
    Optional<Product> findOneById(Long id);

    @Query("""
    SELECT p FROM Product p
    LEFT JOIN FETCH p.category c
    LEFT JOIN FETCH p.brand b
    WHERE (COALESCE(:productIds, NULL) IS NULL OR p.id IN :productIds)
      AND (COALESCE(:categoryIds, NULL) IS NULL OR p.category.id IN :categoryIds)
      AND (COALESCE(:brandIds, NULL) IS NULL OR p.brand.id IN :brandIds)
      AND (COALESCE(:keyword, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:includeZero = TRUE OR p.supply > 0)
      AND (:isDeleted IS NULL OR p.isDeleted = :isDeleted)
""")
    List<Product> findAllWithFilters(
            @Param("productIds") List<Long> productIds,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("brandIds") List<Long> brandIds,
            @Param("keyword") String keyword,
            @Param("includeZero") Boolean includeZero,
            @Param("isDeleted") Boolean isDeleted
    );

    @Query(value = """
    SELECT p FROM Product p
    LEFT JOIN FETCH p.category c
    LEFT JOIN FETCH p.brand b
    WHERE (COALESCE(:productIds, NULL) IS NULL OR p.id IN :productIds)
      AND (COALESCE(:categoryIds, NULL) IS NULL OR p.category.id IN :categoryIds)
      AND (COALESCE(:brandIds, NULL) IS NULL OR p.brand.id IN :brandIds)
      AND (COALESCE(:keyword, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:includeZero = TRUE OR p.supply > 0)
      AND (:isDeleted IS NULL OR p.isDeleted = :isDeleted)
""", countQuery = """
    SELECT COUNT(p) FROM Product p
    WHERE (COALESCE(:productIds, NULL) IS NULL OR p.id IN :productIds)
      AND (COALESCE(:categoryIds, NULL) IS NULL OR p.category.id IN :categoryIds)
      AND (COALESCE(:brandIds, NULL) IS NULL OR p.brand.id IN :brandIds)
      AND (COALESCE(:keyword, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:includeZero = TRUE OR p.supply > 0)
      AND (:isDeleted IS NULL OR p.isDeleted = :isDeleted)
""")
    Page<Product> findAllWithFilters(
            @Param("productIds") List<Long> productIds,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("brandIds") List<Long> brandIds,
            @Param("keyword") String keyword,
            @Param("includeZero") Boolean includeZero,
            @Param("isDeleted") Boolean isDeleted,
            Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.name = :name")
    Optional<Product> findByName(
            String name
    );

    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdIncludingDeleted(@Param("id") Long id);

    @Query("SELECT p FROM Product p WHERE p.id = :id AND p.isDeleted = false")
    Optional<Product> findByIdNotDeleted(@Param("id") Long id);

    @Query("SELECT p.isDeleted FROM Product p WHERE p.id = :productId")
    Boolean isProductSoftDeleted(@Param("productId") Long productId);
}
