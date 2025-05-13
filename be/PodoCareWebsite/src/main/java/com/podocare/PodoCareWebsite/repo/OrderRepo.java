package com.podocare.PodoCareWebsite.repo;


import com.podocare.PodoCareWebsite.DTO.OrderDisplayDTO;
import com.podocare.PodoCareWebsite.model.Order;
import java.util.Date;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    @Query("SELECT o.id FROM Order o WHERE "
            + "(COALESCE(:supplierIds, NULL) IS NULL OR o.supplier.id IN :supplierIds) "
            + "AND (COALESCE(:dateFrom, NULL) IS NULL OR o.orderDate >= :dateFrom) "
            + "AND (COALESCE(:dateTo, NULL) IS NULL OR o.orderDate <= :dateTo)")
    List<Long> findAllOrderIdsWithFilters(
            @Param("supplierIds") List<Long> supplierIds,
            @Param("dateFrom") Date dateFrom,
            @Param("dateTo") Date dateTo
    );

    @Query("""
    SELECT new com.podocare.PodoCareWebsite.DTO.OrderDisplayDTO(
        o.id, o.supplier.id, o.supplier.name, o.orderNumber, o.orderDate, NULL, o.shippingVatRate, o.shippingCost, o.totalNet, o.totalVat, o.totalValue
    )
    FROM Order o
    WHERE o.id = :orderId
""")
    Optional<OrderDisplayDTO> findOrderDisplayById(@Param("orderId") Long orderId);

    Optional<Order> findTopByOrderByOrderNumberDesc();

}
