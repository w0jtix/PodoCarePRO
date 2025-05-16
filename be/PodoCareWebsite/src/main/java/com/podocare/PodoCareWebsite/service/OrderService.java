package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.repo.OrderRepo;
import lombok.RequiredArgsConstructor;
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
    private final ProductService productService;

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

            Map<Long, Integer> productQuantitiesForCreation = buildProductQuantityMapFromDTO(orderToCreate.getOrderProductDTOList());

            Order orderToSave = orderToCreate.toEntity();
            orderToSave.setOrderProducts(new ArrayList<>()); //save without OPs to get orderId first for OP creation

            Order savedOrder = orderRepo.save(orderToSave);
            List<OrderProduct> newProducts = orderProductService.createOrderProducts(orderToCreate.getOrderProductDTOList(), savedOrder);
            savedOrder.getOrderProducts().addAll(newProducts);

            orderRepo.save(savedOrder);

            for(Long productId : productQuantitiesForCreation.keySet()) {
                int createdQty = productQuantitiesForCreation.get(productId);
                productService.resurrectProductIfSoftDeletedAndSetSupply(productId, createdQty);
            }

            return getOrderDisplayById((savedOrder).getId());
        } catch (Exception e) {
            throw new CreationException("Failed to create Order. Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public OrderDisplayDTO updateOrder(Long orderId, OrderRequestDTO orderDTO) {
        try{
            Order existingOrder = getOrderById(orderId);

            Map<Long, Integer> productQuantitiesForDeletion = buildProductQuantityMapFromExisting(existingOrder.getOrderProducts());

            List<Long> existingOrderProductIds = existingOrder.getOrderProducts().stream()
                    .map(OrderProduct::getId)
                    .collect(Collectors.toList());
            orderProductService.batchDeleteOrderProductsByIds(existingOrderProductIds);
            existingOrder.getOrderProducts().clear();

            Map<Long, Integer> productQuantitiesForCreation = buildProductQuantityMapFromDTO(orderDTO.getOrderProductDTOList());

            List<OrderProduct> newProducts = orderProductService.createOrderProducts(orderDTO.getOrderProductDTOList(), existingOrder);
            existingOrder.getOrderProducts().addAll(newProducts);

            existingOrder.setSupplier(SupplierDTO.toSupplierReference(orderDTO.getSupplierId()));
            existingOrder.setOrderDate(orderDTO.getOrderDate());
            existingOrder.setShippingVatRate(orderDTO.getShippingVatRate());
            existingOrder.setShippingCost(orderDTO.getShippingCost());
            existingOrder.setTotalNet(orderDTO.getTotalNet());
            existingOrder.setTotalVat(orderDTO.getTotalVat());
            existingOrder.setTotalValue(orderDTO.getTotalValue());
            Order savedOrder = orderRepo.save(existingOrder);

            Set<Long> commonProductIds = new HashSet<>(productQuantitiesForCreation.keySet());
            commonProductIds.retainAll(productQuantitiesForDeletion.keySet());

            if (!commonProductIds.isEmpty()) {
                for(Long productId : commonProductIds) {
                    int createdQty = productQuantitiesForCreation.get(productId);
                    int deletedQty = productQuantitiesForDeletion.get(productId);
                    int difference = createdQty - deletedQty;
                    if(difference > 0) {
                        productService.resurrectProductIfSoftDeletedAndSetSupply(productId, difference);
                    } else if (difference < 0) {
                        productService.manageDeletionStatusAndSupplyByOrderProduct(productId, -difference);
                    }
                }
            }

            Set<Long> onlyCreated = new HashSet<>(productQuantitiesForCreation.keySet());
            onlyCreated.removeAll(commonProductIds);
            for (Long productId : onlyCreated) {
                int createdQty = productQuantitiesForCreation.get(productId);
                productService.resurrectProductIfSoftDeletedAndSetSupply(productId, createdQty);
            }

            Set<Long> onlyDeleted = new HashSet<>(productQuantitiesForDeletion.keySet());
            onlyDeleted.removeAll(commonProductIds);
            for (Long productId : onlyDeleted) {
                int deletedQty = productQuantitiesForDeletion.get(productId);
                productService.manageDeletionStatusAndSupplyByOrderProduct(productId, deletedQty);
            }

            return getOrderDisplayById(savedOrder.getId());
        } catch (Exception e) {
            throw new UpdateException("Failed to update Order, Reason: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void deleteOrderById(Long orderId) {
        try{
            Map<Long, Integer> productQuantitiesForDeletion = buildProductQuantityMapFromExisting(getOrderById(orderId).getOrderProducts());

            List<Long> orderProductIds = getOrderDTOById(orderId).getOrderProductDTOList()
                    .stream()
                    .map(OrderProductDTO::getId)
                    .toList();

            orderProductService.batchDeleteOrderProductsByIds(orderProductIds);
            orderRepo.deleteById(orderId);

            for(Long productId : productQuantitiesForDeletion.keySet()) {
                int deletedQty = productQuantitiesForDeletion.get(productId);
                productService.manageDeletionStatusAndSupplyByOrderProduct(productId, deletedQty);
            }
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

    private Map<Long, Integer> buildProductQuantityMapFromExisting(List<OrderProduct> orderProducts) {
        Map<Long, Integer> quantityMap = new HashMap<>();
        for (OrderProduct op : orderProducts) {
            quantityMap.merge(op.getProduct().getId(), op.getQuantity(), Integer::sum);
        }
        return quantityMap;
    }

    private Map<Long, Integer> buildProductQuantityMapFromDTO(List<OrderProductRequestDTO> dtoList) {
        Map<Long, Integer> quantityMap = new HashMap<>();
        for (OrderProductRequestDTO dto : dtoList) {
            quantityMap.merge(dto.getProductId(), dto.getQuantity(), Integer::sum);
        }
        return quantityMap;
    }

}
