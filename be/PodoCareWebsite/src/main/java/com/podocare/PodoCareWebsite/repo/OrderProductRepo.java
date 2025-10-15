package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.model.Product;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderProductRepo extends JpaRepository<OrderProduct, Long> {

    boolean existsByProductId(Long productId);

    @Query("SELECT CASE WHEN COUNT(op) > 0 THEN true ELSE false END " +
            "FROM OrderProduct op " +
            "WHERE op.product.id = :productId " +
            "AND (:excludeOrderId IS NULL OR op.order.id != :excludeOrderId)")
    boolean existsByProductIdAndOrderIdNot(@Param("productId") Long productId,
                                           @Param("excludeOrderId") Long excludeOrderId);

    List<OrderProduct> findByProductId(Long productId);

    @Modifying
    @Query("DELETE FROM OrderProduct op WHERE op.order.id = :orderId")
    void deleteByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT COUNT(op) FROM OrderProduct op WHERE op.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);

}
