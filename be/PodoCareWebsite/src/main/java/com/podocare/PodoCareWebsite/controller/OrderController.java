package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.OrderDTO;
import com.podocare.PodoCareWebsite.DTO.request.OrderFilterDTO;
import com.podocare.PodoCareWebsite.service.OrderService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;


    @PostMapping("/search")
    public ResponseEntity<List<OrderDTO>> getOrders(@RequestBody OrderFilterDTO filter) {
        List<OrderDTO> ordersDTOList = orderService.getOrders(filter);
        return new ResponseEntity<>(ordersDTOList, ordersDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable(value = "id") Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@NonNull @RequestBody OrderDTO order) {
        OrderDTO newOrder = orderService.createOrder(order);
        return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable(value = "id") Long id, @NonNull @RequestBody OrderDTO order) {
        OrderDTO saved = orderService.updateOrder(id, order);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable(value = "id") Long id) {
        orderService.deleteOrderById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
