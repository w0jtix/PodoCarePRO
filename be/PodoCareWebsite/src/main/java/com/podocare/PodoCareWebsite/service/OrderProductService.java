package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.repo.OrderProductRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class OrderProductService {

   private final OrderProductRepo orderProductRepo;
   private final SupplyManagerService supplyManagerService;


    public OrderProductDTO getOrderProductById(Long orderProductId) {
        return new OrderProductDTO(orderProductRepo.findById(orderProductId)
                .orElseThrow(() -> new ResourceNotFoundException("OrderProduct not found with ID: " + orderProductId)));
    }

    @Transactional
    public List<OrderProduct> createOrderProducts(List<OrderProductDTO> orderProductDTOList, Order order) {
        try {
             return orderProductDTOList.stream()
                    .map(orderProductDTO -> orderProductDTO.toEntity(order))
                    .map(orderProductRepo::save)
                    .peek(savedOrderProduct ->
                            supplyManagerService.updateSupply(
                                    new SupplyManagerDTO(
                                            savedOrderProduct.getProduct().getId(),
                                            savedOrderProduct.getQuantity(),
                                            "increment")
                            )
                    )
                     .collect(Collectors.toList());
        } catch (Exception e) {
            throw new CreationException("Failed to create OrderProducts. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteOrderProductById(Long orderProductId) {
        try{
            OrderProductDTO orderProductDTO = getOrderProductById(orderProductId);
            supplyManagerService.updateSupply(
                    new SupplyManagerDTO(
                            orderProductDTO.getProductId(),
                            orderProductDTO.getQuantity(),
                            "decrement"));

            orderProductRepo.deleteById(orderProductId);
        }catch (Exception e) {
            throw new DeletionException("Failed to delete OrderProduct with id: " + orderProductId + ", Reason: " + e.getMessage(), e);
        }
    }
}
