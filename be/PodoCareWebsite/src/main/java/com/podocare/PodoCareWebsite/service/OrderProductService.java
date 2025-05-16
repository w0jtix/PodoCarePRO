package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.repo.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.ProductRepo;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class OrderProductService {

   private final OrderProductRepo orderProductRepo;
   private final SupplyManagerService supplyManagerService;

   private final ProductService productService;

    public OrderProductDTO getOrderProductById(Long orderProductId) {
        return new OrderProductDTO(orderProductRepo.findById(orderProductId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderProduct not found with ID: " + orderProductId)));
    }

    public OrderProductDisplayDTO getOrderProductDisplayById(Long orderProductId) {
        return orderProductRepo.findOrderProductDisplayById(orderProductId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderProduct not found with given id." + orderProductId));
    }

    public List<OrderProductDisplayDTO> getOrderProductDisplayListByOrderId(Long orderId) {
        List<OrderProductDisplayDTO> orderProducts = orderProductRepo.findOrderProductDisplayDTOsByOrderId(orderId);
        if (orderProducts.isEmpty()) {
            throw new ResourceNotFoundException("OrderProducts not found with given orderId: " + orderId);
        }
        return orderProducts;
    }

    @Transactional
    public List<OrderProduct> createOrderProducts(List<OrderProductRequestDTO> orderProductDTOList, Order order)  {
        try {
             return orderProductDTOList.stream()
                    .map(orderProductRequestDTO -> orderProductRequestDTO.toEntity(order))
                    .map(orderProductRepo::save)
                     .collect(Collectors.toList());
        } catch (Exception e) {
            throw new CreationException("Failed to create OrderProducts. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void batchDeleteOrderProductsByIds(List<Long> orderProductIds) {
        for (Long orderProductId : orderProductIds) {
            try {
                orderProductRepo.deleteById(orderProductId);
            } catch (Exception e) {
                throw new DeletionException("Failed to delete OrderProduct with id: " + orderProductId + ", Reason: " + e.getMessage(), e);
            }
        }

    }
}
