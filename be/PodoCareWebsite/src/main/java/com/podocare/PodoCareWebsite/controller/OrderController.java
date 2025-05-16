package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.FilterDTO;
import com.podocare.PodoCareWebsite.DTO.OrderDisplayDTO;
import com.podocare.PodoCareWebsite.DTO.OrderRequestDTO;
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


    @PostMapping("/get")
    public ResponseEntity<List<OrderDisplayDTO>> getOrders(@RequestBody FilterDTO filter) {
        List<OrderDisplayDTO> ordersDTOList = orderService.getOrders(filter);
        return new ResponseEntity<>(ordersDTOList, ordersDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDisplayDTO> getOrderById(@PathVariable Long orderId) {
        OrderDisplayDTO orderDTO = orderService.getOrderDisplayById(orderId);
        return new ResponseEntity<>(orderDTO, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<OrderDisplayDTO> createOrder(@RequestBody OrderRequestDTO orderToCreate) {
        OrderDisplayDTO newOrder = orderService.createOrder(orderToCreate);
        return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<OrderDisplayDTO> updateOrder(@PathVariable Long orderId, @RequestBody OrderRequestDTO updatedOrder) {
        OrderDisplayDTO order = orderService.updateOrder(orderId, updatedOrder);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrderById(orderId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
