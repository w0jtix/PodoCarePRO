package com.podocare.PodoCareWebsite.repo;


import com.podocare.PodoCareWebsite.model.Order;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"supplier", "orderProducts"})
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findOneByIdWithProducts(Long id);

    @EntityGraph(attributePaths = {"supplier", "orderProducts", "orderProducts.product"})
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findOneByIdWithDetails(Long id);


    @Query("""
    SELECT DISTINCT o FROM Order o
    LEFT JOIN FETCH o.supplier
    WHERE (:supplierIds IS NULL OR o.supplier.id IN :supplierIds)
    AND (o.orderDate >= :dateFrom)
    AND (o.orderDate <= :dateTo)
    """)
    List<Order> findAllWithFilters(
            @Param("supplierIds") List<Long> supplierIds,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo
    );

    Optional<Order> findTopByOrderByOrderNumberDesc();

}
