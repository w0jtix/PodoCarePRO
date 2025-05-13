package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.model.Supplier;
import com.podocare.PodoCareWebsite.repo.OrderRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;


import static java.util.Objects.isNull;


@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepo orderRepo;
    private final OrderProductService orderProductService;

    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
    }

    public OrderDTO getOrderDTOById(Long orderId) {
        return new OrderDTO(orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with given id." + orderId)));
    }

    public OrderDisplayDTO getOrderDisplayById(Long orderId) {
        OrderDisplayDTO orderDisplayDTO = orderRepo.findOrderDisplayById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with given id." + orderId));

        List<OrderProductDisplayDTO> orderProducts = orderProductService.getOrderProductDisplayListByOrderId(orderId);
        orderDisplayDTO.setOrderProductDTOList(orderProducts);
        return orderDisplayDTO;
    }

    public List<OrderDisplayDTO> getOrders(FilterDTO filter){
        if(isNull(filter)) {
            filter = new FilterDTO();
        }

        return orderRepo.findAllOrderIdsWithFilters(filter.getSupplierIds(), filter.getDateFrom(), filter.getDateTo())
                .stream()
                .map(this::getOrderDisplayById)
                .toList();
    }

    @Transactional
    public OrderDisplayDTO createOrder (OrderRequestDTO orderToCreate) {
        try{
            generateOrderNumber(orderToCreate);
            Order orderToSave = orderToCreate.toEntity();
            orderToSave.setOrderProducts(new ArrayList<>()); //save without OPs to get orderId first for OP creation

            Order savedOrder = orderRepo.save(orderToSave);
            List<OrderProduct> newProducts = orderProductService.createOrderProducts(orderToCreate.getOrderProductDTOList(), savedOrder);
            savedOrder.getOrderProducts().addAll(newProducts);

            return getOrderDisplayById(orderRepo.save(savedOrder).getId());
        } catch (Exception e) {
            throw new CreationException("Failed to create Order. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public OrderDisplayDTO updateOrder(Long orderId, OrderRequestDTO orderDTO) {
        try{
            Order existingOrder = getOrderById(orderId);

            List<Long> existingOrderProductIds = existingOrder.getOrderProducts().stream()
                    .map(OrderProduct::getId)
                    .collect(Collectors.toList());

            orderProductService.batchDeleteOrderProductsBtIds(existingOrderProductIds);
            existingOrder.getOrderProducts().clear();

            List<OrderProduct> newProducts = orderProductService.createOrderProducts(orderDTO.getOrderProductDTOList(), existingOrder);
            existingOrder.getOrderProducts().addAll(newProducts);

            existingOrder.setSupplier(SupplierDTO.toSupplierReference(orderDTO.getSupplierId()));
            existingOrder.setOrderDate(orderDTO.getOrderDate());
            existingOrder.setShippingVatRate(orderDTO.getShippingVatRate());
            existingOrder.setShippingCost(orderDTO.getShippingCost());
            existingOrder.setTotalNet(orderDTO.getTotalNet());
            existingOrder.setTotalVat(orderDTO.getTotalVat());
            existingOrder.setTotalValue(orderDTO.getTotalValue());

            return getOrderDisplayById(orderRepo.save(existingOrder).getId());
        } catch (Exception e) {
            throw new UpdateException("Failed to update Order, Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteOrderById(Long orderId) {
        try{
            getOrderDTOById(orderId).getOrderProductDTOList()
                    .forEach(orderProductDTO -> orderProductService.deleteOrderProductById(orderProductDTO.getId()));
            orderRepo.deleteById(orderId);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Order, Reason: " + e.getMessage(), e);
        }
    }

    private void generateOrderNumber(OrderRequestDTO orderDTO) {
        try {
            Optional<Order> lastOrder = orderRepo.findTopByOrderByOrderNumberDesc();
            orderDTO.setOrderNumber(lastOrder.map(order -> order.getOrderNumber() + 1).orElse(1L));
        } catch (DataAccessException e) {
            throw new CreationException("Failed to generate order number.", e);
        }
    }


}
