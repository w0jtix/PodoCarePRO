package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.OrderDTO;
import com.podocare.PodoCareWebsite.DTO.request.OrderFilterDTO;
import com.podocare.PodoCareWebsite.service.OrderService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;


    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Page<OrderDTO>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestBody OrderFilterDTO filter) {
        Page<OrderDTO> ordersPage = orderService.getOrders(filter, page, size);
        return new ResponseEntity<>(ordersPage, ordersPage.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable(value = "id") Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    @PostMapping("/preview")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<OrderDTO> getOrderPreview(@NonNull @RequestBody OrderDTO order) {
        OrderDTO previewOrder = orderService.getOrderPreview(order);
        return  new ResponseEntity<>(previewOrder, HttpStatus.CREATED);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<OrderDTO> createOrder(@NonNull @RequestBody OrderDTO order) {
        OrderDTO newOrder = orderService.createOrder(order);
        return new ResponseEntity<>(newOrder, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable(value = "id") Long id, @NonNull @RequestBody OrderDTO order) {
        OrderDTO saved = orderService.updateOrder(id, order);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteOrder(@PathVariable(value = "id") Long id) {
        orderService.deleteOrderById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
