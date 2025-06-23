package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.OrderDTO;
import com.podocare.PodoCareWebsite.DTO.OrderProductDTO;
import com.podocare.PodoCareWebsite.DTO.request.OrderFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Order;
import com.podocare.PodoCareWebsite.model.OrderProduct;
import com.podocare.PodoCareWebsite.model.Product;
import com.podocare.PodoCareWebsite.model.Supplier;
import com.podocare.PodoCareWebsite.repo.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.OrderRepo;
import com.podocare.PodoCareWebsite.repo.ProductRepo;
import com.podocare.PodoCareWebsite.repo.SupplierRepo;
import com.podocare.PodoCareWebsite.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepo orderRepo;
    private final OrderProductRepo orderProductRepo;
    private final SupplierRepo supplierRepo;
    private final ProductRepo productRepo;

    @Override
    public OrderDTO getOrderById(Long id) {
        return new OrderDTO(orderRepo.findOneByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with given id." + id)));
    }

    @Override
    public List<OrderDTO> getOrders(OrderFilterDTO filter) {
        if(isNull(filter)) {
            filter = new OrderFilterDTO();
        }

        LocalDate dateFrom = filter.getDateFrom() != null ? filter.getDateFrom() : LocalDate.of(1900, 1, 1);
        LocalDate dateTo = filter.getDateTo() != null ? filter.getDateTo() : LocalDate.of(2100, 12, 31);

        return orderRepo.findAllWithFilters(
                        filter.getSupplierIds(),
                        dateFrom,
                        dateTo)
                .stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO) {
        try{
            Supplier supplier = supplierRepo.findById(orderDTO.getSupplier().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + orderDTO.getSupplier().getId()));

            Long orderNumber = generateOrderNumber();

            Order order = Order.builder()
                    .supplier(supplier)
                    .orderNumber(orderNumber)
                    .orderDate(orderDTO.getOrderDate())
                    .shippingVatRate(orderDTO.getShippingVatRate())
                    .shippingCost(orderDTO.getShippingCost())
                    .build();

            for (OrderProductDTO orderProductDTO : orderDTO.getOrderProducts()) {
                OrderProduct orderProduct = createOrderProductAndUpdateInventory(orderProductDTO, order);
                order.addOrderProduct(orderProduct);
            }

            order.calculateTotals();

            Order savedOrder = orderRepo.save(order);
            return new OrderDTO(savedOrder);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CreationException("Failed to create Order. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public OrderDTO updateOrder(Long id, OrderDTO orderDTO) {
        try{
            Order existingOrder = orderRepo.findOneByIdWithProducts(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

            Map<Long, Integer> inventoryAdjustments = new HashMap<>();
            for (OrderProduct existingOrderProduct : existingOrder.getOrderProducts()) {
                Long productId = existingOrderProduct.getProduct().getId();
                inventoryAdjustments.merge(productId, -existingOrderProduct.getQuantity(), Integer::sum);
            }
            existingOrder.getOrderProducts().clear(); // check if orphan removal works mozna tez .remove
            /*orderProductRepo.deleteByOrderId(existingOrder.getId());*/

            Supplier supplier = existingOrder.getSupplier();
            if (orderDTO.getSupplier().getId() != null) {
                supplier = supplierRepo.findById(orderDTO.getSupplier().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + orderDTO.getSupplier().getId()));
            }

            Order updatedOrder = Order.builder()
                    .id(existingOrder.getId())
                    .supplier(supplier)
                    .orderNumber(existingOrder.getOrderNumber())
                    .orderDate(orderDTO.getOrderDate())
                    .shippingVatRate(orderDTO.getShippingVatRate())
                    .shippingCost(orderDTO.getShippingCost())
                    .build();

            for (OrderProductDTO orderProductDTO : orderDTO.getOrderProducts()) {
                Product product = getOrRestoreProduct(orderProductDTO.getProduct().getId());

                OrderProduct newOrderProduct = OrderProduct.builder()
                        .order(updatedOrder)
                        .product(product)
                        .quantity(orderProductDTO.getQuantity())
                        .vatRate(orderProductDTO.getVatRate())
                        .price(orderProductDTO.getPrice())
                        .build();

                updatedOrder.addOrderProduct(newOrderProduct);

                inventoryAdjustments.merge(product.getId(), orderProductDTO.getQuantity(), Integer::sum);
            }

            updatedOrder.calculateTotals();
            applyInventoryAdjustments(inventoryAdjustments);
            checkForProductDeletions(inventoryAdjustments, updatedOrder.getId());

            Order savedOrder = orderRepo.save(updatedOrder);

            return new OrderDTO(savedOrder);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new UpdateException("Failed to update Order, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteOrderById(Long id) {
        try{
            Order existingOrder = orderRepo.findOneByIdWithProducts(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + id));

            Map<Long, Integer> inventoryAdjustments = new HashMap<>();
            for (OrderProduct orderProduct : existingOrder.getOrderProducts()) {
                Long productId = orderProduct.getProduct().getId();
                int quantity = orderProduct.getQuantity();

                inventoryAdjustments.merge(productId, -quantity, Integer::sum);
            }

            applyInventoryAdjustments(inventoryAdjustments);
            checkForProductDeletions(inventoryAdjustments, id);

            orderRepo.delete(existingOrder);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Order, Reason: " + e.getMessage(), e);
        }
    }

    private Long generateOrderNumber() {
        try {
            Optional<Order> lastOrder = orderRepo.findTopByOrderByOrderNumberDesc();
            return lastOrder.map(order -> order.getOrderNumber() + 1).orElse(1L);
        } catch (DataAccessException e) {
            throw new CreationException("Failed to generate order number.", e);
        }
    }

    private OrderProduct createOrderProductAndUpdateInventory(OrderProductDTO orderProductDTO, Order order) {
        Product product = productRepo.findById(orderProductDTO.getProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + orderProductDTO.getProduct().getId()));

        product.setSupply(product.getSupply() + orderProductDTO.getQuantity());
        productRepo.save(product);

        return OrderProduct.builder()
                .order(order)
                .product(product)
                .quantity(orderProductDTO.getQuantity())
                .vatRate(orderProductDTO.getVatRate())
                .price(orderProductDTO.getPrice())
                .build();
    }

    private Product getOrRestoreProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        if(product.getIsDeleted()) {
            product.setIsDeleted(false);
        }
        return product;
    }

    private void applyInventoryAdjustments(Map<Long, Integer> inventoryAdjustments) {
        if (inventoryAdjustments.isEmpty()) return;

        List<Long> productIds = inventoryAdjustments.keySet()
                .stream()
                .filter(id -> inventoryAdjustments.get(id) != 0)
                .collect(Collectors.toList());

        if (productIds.isEmpty()) return;

        List<Product> products = productRepo.findAllById(productIds);

        for (Product product : products) {
            Integer quantityChange = inventoryAdjustments.get(product.getId());
            if (quantityChange != null && quantityChange != 0) {
                product.setSupply(product.getSupply() + quantityChange);
            }
        }
        productRepo.saveAll(products);
    }

    private void checkForProductDeletions(Map<Long, Integer> inventoryAdjustments, Long orderId) {
        for(Map.Entry<Long, Integer> entry : inventoryAdjustments.entrySet()) {
            Long productId = entry.getKey();
            Integer quantityChange = entry.getValue();

            if(quantityChange < 0) {
                Product product = productRepo.findById(productId)
                        .orElse(null);

                if(product != null && product.getIsDeleted()) {
                    checkAndDeleteSoftDeletedProduct(product, orderId);
                }
            }
        }
    }

    private void checkAndDeleteSoftDeletedProduct(Product product, Long orderId) {
        if(!product.getIsDeleted()) {
            return;
        }
        boolean hasOtherReferences = orderProductRepo.existsByProductIdAndOrderIdNot(
                product.getId(), orderId);

        if(!hasOtherReferences) {
            productRepo.delete(product);
        }
    }
}

