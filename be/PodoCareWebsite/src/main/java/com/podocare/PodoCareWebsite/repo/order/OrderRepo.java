package com.podocare.PodoCareWebsite.repo.order;

import com.podocare.PodoCareWebsite.model.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    @Query("SELECT p FROM Order p WHERE p.orderNumber = :orderNumber")
    Order findByOrderNumber(Integer orderNumber);

    Optional<Order> findTopByOrderByOrderNumberDesc();
}
