package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderCreationException;
import com.podocare.PodoCareWebsite.model.order.DraftOrder;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.repo.order.DraftOrderRepo;
import com.podocare.PodoCareWebsite.repo.order.OrderRepo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
public class DraftOrderService {

    @Autowired
    private DraftOrderRepo draftOrderRepo;
    @Autowired
    private OrderRepo orderRepo;

    public DraftOrder createDraftOrder() {
        DraftOrder draftOrder = new DraftOrder();
        draftOrder.setOrderStatus("DRAFT");
        draftOrder.setOrderNumber(generateOrderNumber());
        try {
            return draftOrderRepo.save(draftOrder);
        } catch (Exception e) {
            log.error("Error creating draftOrder: {}", draftOrder, e);
            throw new OrderCreationException("Failed to create DraftOrder.", e);
        }
    }

    private long generateOrderNumber() {
        try {
            Optional<Order> lastOrder = orderRepo.findTopByOrderByOrderNumberDesc();
            return lastOrder.map(order -> order.getOrderNumber() + 1).orElse(1L);
        } catch (DataAccessException e) {
            throw new OrderCreationException("Failed to generate order number.", e);
        }
    }
}
