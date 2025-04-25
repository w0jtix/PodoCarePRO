package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.DTO.OrderDTO;
import com.podocare.PodoCareWebsite.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;


    @GetMapping
    public ResponseEntity<List<OrderDTO>> getOrders(@RequestBody(required = false) FilterDTO filter) {
        List<OrderDTO> ordersDTOList = orderService.getOrders(filter);
        return new ResponseEntity<>(ordersDTOList, ordersDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        OrderDTO orderDTO = orderService.getOrderById(orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO orderToCreate) {
        OrderDTO newOrder = orderService.createOrder(orderToCreate);
        return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable Long orderId, @RequestBody OrderDTO updatedOrder) {
        OrderDTO order = orderService.updateOrder(orderId, updatedOrder);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrderById(orderId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
