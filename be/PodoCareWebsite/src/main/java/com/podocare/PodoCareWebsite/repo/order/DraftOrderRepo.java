package com.podocare.PodoCareWebsite.repo.order;

import com.podocare.PodoCareWebsite.model.order.DraftOrder;
import com.podocare.PodoCareWebsite.model.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DraftOrderRepo extends JpaRepository<DraftOrder, Long> {

    @Query("SELECT p FROM DraftOrder p WHERE p.orderNumber = :orderNumber")
    DraftOrder findByOrderNumber(Integer orderNumber);
}
