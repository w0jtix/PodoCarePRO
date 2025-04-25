package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.DTO.OrderDTO;
import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.repo.OrderRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;


import static java.util.Objects.isNull;


@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepo orderRepo;
    private final OrderProductService orderProductService;

    public OrderDTO getOrderById(Long orderId) {
        return new OrderDTO(orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with given id." + orderId)));
    }

    public List<OrderDTO> getOrders(FilterDTO filter){
        if(isNull(filter)) {
            filter = new FilterDTO();
        }

        return orderRepo.findAllWithFilters(filter.getSupplierIds(), filter.getDateFrom(), filter.getDateTo())
                .stream()
                .map(OrderDTO::new)
                .toList();
    }

    @Transactional
    public OrderDTO createOrder (OrderDTO orderToCreate) {
        try{
            orderToCreate = generateOrderNumber(orderToCreate);
            Order orderToSave = orderToCreate.toEntity();
            orderToSave.setOrderProducts(new ArrayList<>());
            Order savedOrder = orderRepo.save(orderToSave);

            List<OrderProduct> orderProductsWithOrderId = orderProductService.createOrderProducts(orderToCreate.getOrderProductDTOList(), savedOrder);
            savedOrder.setOrderProducts(orderProductsWithOrderId);

            return new OrderDTO(orderRepo.save(savedOrder));
        } catch (Exception e) {
            throw new CreationException("Failed to create Order. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public OrderDTO updateOrder(Long orderId, OrderDTO orderDTO) {
        try{
            OrderDTO existingOrder = getOrderById(orderId);

            existingOrder.getOrderProductDTOList()
                        .forEach(orderProductDTO -> orderProductService.deleteOrderProductById(orderProductDTO.getId()));

            List<OrderProduct> newProducts = orderProductService.createOrderProducts(orderDTO.getOrderProductDTOList(), existingOrder.toEntity());
            Order updatedOrder = orderDTO.toEntity();
            updatedOrder.setOrderProducts(newProducts); // asingning with ids to prevent duplicate save
            return new OrderDTO(updatedOrder);
        } catch (Exception e) {
            throw new UpdateException("Failed to update Order, Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteOrderById(Long orderId) {
        try{
            getOrderById(orderId).getOrderProductDTOList()
                    .forEach(orderProductDTO -> orderProductService.deleteOrderProductById(orderProductDTO.getId()));
            orderRepo.deleteById(orderId);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Order, Reason: " + e.getMessage(), e);
        }
    }

    private OrderDTO generateOrderNumber(OrderDTO orderDTO) {
        try {
            Optional<Order> lastOrder = orderRepo.findTopByOrderByOrderNumberDesc();
            orderDTO.setOrderNumber(lastOrder.map(order -> order.getOrderNumber() + 1).orElse(1L));
            return orderDTO;
        } catch (DataAccessException e) {
            throw new CreationException("Failed to generate order number.", e);
        }
    }


}
