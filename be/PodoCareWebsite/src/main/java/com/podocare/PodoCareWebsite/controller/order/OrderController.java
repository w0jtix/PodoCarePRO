package com.podocare.PodoCareWebsite.controller.order;

import com.podocare.PodoCareWebsite.model.order.DTOs.OrderDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderFilterDTO;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.service.order.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController (OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> ordersList = orderService.getOrders();
        return new ResponseEntity<>(ordersList, ordersList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @PostMapping("/filter")
    public ResponseEntity<List<OrderDTO>> getFilteredOrders(@RequestBody OrderFilterDTO orderFilterDTO) {
        List<OrderDTO> matchingOrders = orderService.getFilteredOrders(orderFilterDTO);
        return new ResponseEntity<>(matchingOrders, matchingOrders.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    //to imo useless bedzie
    @GetMapping("/{orderId}/forEditing")
    public ResponseEntity<OrderDTO> getOrderForEditing(@PathVariable Long orderId) {
        OrderDTO orderDTO = orderService.getOrderDTOByOrderId(orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    @PostMapping("/createOrder")
    public ResponseEntity<Order> createOrder(@RequestBody OrderDTO orderDTO) {
        Order createdOrder = orderService.createOrder(orderDTO);
        return new ResponseEntity<>(createdOrder, HttpStatus.OK);
    }

    @PutMapping("/{orderId}/update")
    public ResponseEntity<Order> updateOrder(@PathVariable Long orderId, @RequestBody OrderDTO updatedOrderDTO) {
        Order updatedOrder = orderService.updateOrder(orderId, updatedOrderDTO);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return new ResponseEntity<>("Successfully deleted Order", HttpStatus.NO_CONTENT);
    }
}
