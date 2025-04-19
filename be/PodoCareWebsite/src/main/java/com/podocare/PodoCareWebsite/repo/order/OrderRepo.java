package com.podocare.PodoCareWebsite.repo.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.order.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    @Query("SELECT p FROM Order p WHERE p.orderNumber = :orderNumber")
    Order findByOrderNumber(Integer orderNumber);

    Optional<Order> findTopByOrderByOrderNumberDesc();

    @Query("SELECT SUM(op.quantity) FROM Order o " +
            "JOIN o.orderProducts op " +
            "WHERE o.supplier = :supplier")
    Long countProductsBySupplier(Supplier supplier);

    @Query("SELECT o FROM Order o WHERE o.supplier.id IN :supplierIds")
    List<Order> findOrdersBySupplierIds(@Param("supplierIds") List<Long> supplierIds);
}
