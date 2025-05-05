package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.DTO.ProductDTO;
import com.podocare.PodoCareWebsite.DTO.ProductDisplayDTO;
import com.podocare.PodoCareWebsite.DTO.ProductRequestDTO;
import com.podocare.PodoCareWebsite.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    /*@Query("SELECT p FROM Product p WHERE "
            + "(COALESCE(:categories, NULL) IS NULL OR p.category IN :categories) "
            + "AND (COALESCE(:brandIds, NULL) IS NULL OR p.brand.id IN :brandIds) "
            + "AND (COALESCE(:keyword, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "AND (COALESCE(:available, NULL) IS NULL OR p.isDeleted = :available)")
    List<Product> findAllWithFilters(
            @Param("categories") List<String> categories,
            @Param("brandIds") List<Long> brandIds,
            @Param("keyword") String keyword,
            @Param("available") Boolean available
    );*/

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.ProductDisplayDTO(
         p.id, p.name, p.category.id, p.category.name, p.category.color, p.brand.id, p.brand.name, p.description, COALESCE(s.supply, 0)
    )
    FROM Product p
    LEFT JOIN SupplyManager s ON p.id = s.productId
    WHERE (COALESCE(:categoryIds, NULL) IS NULL OR p.category.id IN :categoryIds)
      AND (COALESCE(:brandIds, NULL) IS NULL OR p.brand.id IN :brandIds)
      AND (COALESCE(:keyword, '') = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
      AND (:includeZero IS NULL OR :includeZero = FALSE OR COALESCE(s.supply, 0) > 0)
""")
    List<ProductDisplayDTO> findAllWithFilters(
            @Param("categoryIds") List<Long> categoryIds,
            @Param("brandIds") List<Long> brandIds,
            @Param("keyword") String keyword,
            @Param("includeZero") Boolean includeZero
    );

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.ProductDTO(
        p.id, p.name, p.category.id, p.brand.id, p.description, p.isDeleted
    )
    FROM Product p
    WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(:name))
""")
    Optional<ProductDTO> findByProductName(String name);

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.ProductDisplayDTO(
        p.id, p.name, p.category.id, p.category.name, p.category.color, p.brand.id, p.brand.name, p.description, COALESCE(s.supply, 0)
    )
    FROM Product p
    LEFT JOIN SupplyManager s ON p.id = s.productId
    WHERE p.id = :productId
""")
    Optional<ProductDisplayDTO> findProductDisplayById(@Param("productId") Long productId);
}
