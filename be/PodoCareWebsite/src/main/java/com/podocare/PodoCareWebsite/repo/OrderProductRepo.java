package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.DTO.OrderProductDisplayDTO;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderProductRepo extends JpaRepository<OrderProduct, Long> {

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.OrderProductDisplayDTO(
         op.id, op.order.id, p.id, p.name, p.category.name, p.category.color, p.brand.name, op.quantity, op.vatRate, op.price
    )
    FROM OrderProduct op
    JOIN op.product p
    WHERE op.id = :orderProductId
""")
    Optional<OrderProductDisplayDTO> findOrderProductDisplayById(@Param("orderProductId") Long orderProductId);

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.OrderProductDisplayDTO(
        op.id, op.order.id, p.id, p.name, p.category.name, p.category.color, p.brand.name, op.quantity, op.vatRate, op.price
    )
    FROM OrderProduct op
    JOIN op.product p
    WHERE op.order.id = :orderId
""")
    List<OrderProductDisplayDTO> findOrderProductDisplayDTOsByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT COUNT(op) FROM OrderProduct op WHERE op.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);

}
