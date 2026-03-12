package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.BaseService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BaseServiceRepo extends JpaRepository<BaseService, Long> {

    Optional<BaseService> findOneById(Long id);

    List<BaseService> findAllByCategoryId(Long categoryId);

    Optional<BaseService> findByName(String name);

    @Query("SELECT s FROM BaseService s " +
            "LEFT JOIN FETCH s.category c " +
            "WHERE s.isDeleted = false " +
            "AND (COALESCE(:keyword, '') = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
            "AND (COALESCE(:categoryIds, NULL) IS NULL OR s.category.id IN :categoryIds)"
    )
    List<BaseService> findAllWithFilters(
            @Param("keyword") String keyword,
            @Param("categoryIds") List<Long> categoryIds
            );

    Boolean existsByName(String name);

    @Query("""
        SELECT COUNT(v) > 0
        FROM BaseService s
        JOIN s.variants v
        WHERE s.id = :serviceId AND v.id = :variantId
    """)
    Boolean serviceHasVariant(Long serviceId, Long variantId);

    long countByCategoryIdAndIsDeletedFalse(Long categoryId);

    long countByCategoryId(Long categoryId);
}
