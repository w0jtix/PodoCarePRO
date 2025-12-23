package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.OrderDTO;
import com.podocare.PodoCareWebsite.DTO.request.OrderFilterDTO;

import java.util.List;

public interface OrderService {

    OrderDTO getOrderById(Long id);

    List<OrderDTO> getOrders(OrderFilterDTO filter);

    OrderDTO createOrder(OrderDTO orderDTO);

    OrderDTO updateOrder(Long id, OrderDTO orderDTO);

    void deleteOrderById(Long id);
}
