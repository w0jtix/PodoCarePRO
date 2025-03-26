package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order_product.OrderProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.order.OrderProduct;
import com.podocare.PodoCareWebsite.repo.order.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.EquipmentProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.SaleProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.service.product_category.SaleProductService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OrderProductService {

    @Autowired
    private OrderProductRepo orderProductRepo;
    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private ToolProductRepo toolProductRepo;
    @Autowired
    private EquipmentProductRepo equipmentProductRepo;

    public OrderProduct getOrderProductById(Long orderProductId) {
        return orderProductRepo.findById(orderProductId)
                .orElseThrow(() -> new OrderProductNotFoundException("OrderProduct not found with ID: " + orderProductId));
    }

    public OrderProduct createOrderProduct(Order order, OrderProductDTO orderProductDTO) {
        if (order == null) {
            log.error("Failed to create OrderProduct: 'order' is null.");
            throw new IllegalArgumentException("Order cannot be null.");
        }
        if (orderProductDTO == null) {
            log.error("Failed to create OrderProduct: 'orderProductDTO' is null.");
            throw new IllegalArgumentException("OrderProductDTO cannot be null.");
        }
        if (orderProductDTO.getQuantity() <= 0) {
            log.error("Failed to create OrderProduct: Invalid quantity {}",
                    orderProductDTO.getQuantity());
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
        OrderProduct orderProductToSave = orderProductDtoToOrderProductConversion(order, orderProductDTO);
        try {
            orderProductRepo.save(orderProductToSave);
        } catch (Exception e) {
                log.error("Failed to create OrderProduct. Exception: ", e);
                throw new OrderCreationException("Failed to create OrderProduct.", e);
            }

        return orderProductToSave;
    }

    public OrderProduct updateOrderProduct(Long orderProductId, OrderProductDTO orderProductDTO) {
        OrderProduct existingOrderProduct = getOrderProductById(orderProductId);

        OrderProduct updatedOrderProduct = orderProductDtoToOrderProductConversion(existingOrderProduct.getOrder(), orderProductDTO);

        try {
            orderProductRepo.save(updatedOrderProduct);
        } catch (Exception e) {
            log.error("Failed to create OrderProduct. Exception: ", e);
            throw new OrderCreationException("Failed to create OrderProduct.", e);
        }

        return updatedOrderProduct;
    }

    public void deleteOrderProduct(Long orderProductId) {
        OrderProduct orderProduct = getOrderProductById(orderProductId);
        try {
            orderProductRepo.deleteById(orderProductId);
        } catch (Exception e) {
            throw new OrderDeletionException("Failed to delete the OrderProduct", e);
        }
    }

    private OrderProduct orderProductDtoToOrderProductConversion(Order order, OrderProductDTO orderProductDTO){
        OrderProduct orderProduct = new OrderProduct();
        orderProduct.setOrder(order);
        orderProduct.setPrice(orderProductDTO.getPrice());
        orderProduct.setVATrate(orderProductDTO.getVATrate());
        orderProduct.setQuantity(orderProductDTO.getQuantity());
        defineAndSetProductType(orderProduct, orderProductDTO);
        orderProductRepo.save(orderProduct);
        return orderProduct;
    }

    public OrderProductDTO orderProductToOrderProductDTOConversion(OrderProduct orderProduct) {
        OrderProductDTO orderProductDTO = new OrderProductDTO();
        orderProductDTO.setOrderProductId(orderProduct.getId());
        orderProductDTO.setQuantity(orderProduct.getQuantity());
        orderProductDTO.setPrice(orderProduct.getPrice());
        orderProductDTO.setVATrate(orderProduct.getVATrate());
        orderProductDTO.setOrderId(orderProduct.getOrder().getId());
        if(orderProduct.getSaleProduct() != null) {
            orderProductDTO.setProductId(orderProduct.getSaleProduct().getId());
            orderProductDTO.setProductName(orderProduct.getSaleProduct().getProductName());
            orderProductDTO.setCategory(orderProduct.getSaleProduct().getCategory());
        } else if (orderProduct.getToolProduct() != null){
            orderProductDTO.setProductId(orderProduct.getToolProduct().getId());
            orderProductDTO.setProductName(orderProduct.getToolProduct().getProductName());
            orderProductDTO.setCategory(orderProduct.getToolProduct().getCategory());
        } else if(orderProduct.getEquipmentProduct() != null) {
            orderProductDTO.setProductId(orderProduct.getEquipmentProduct().getId());
            orderProductDTO.setProductName(orderProduct.getEquipmentProduct().getProductName());
            orderProductDTO.setCategory(orderProduct.getEquipmentProduct().getCategory());
        } else {
            throw new ProductNotFoundException("OrderProduct productId not assigned.");
        }
        return orderProductDTO;
    }

    private void defineAndSetProductType(OrderProduct orderProduct, OrderProductDTO orderProductDTO){
        Long productId = orderProductDTO.getProductId();

        if (productId == null) {
            throw new ProductNotFoundException("Product ID cannot be null.");
        }

        if (saleProductRepo.existsById(productId)) {
            orderProduct.setSaleProduct(saleProductRepo.findById(productId).get());
        } else if (toolProductRepo.existsById(productId)) {
            orderProduct.setToolProduct(toolProductRepo.findById(productId).get());
        } else if (equipmentProductRepo.existsById(productId)) {
            orderProduct.setEquipmentProduct(equipmentProductRepo.findById(productId).get());
        } else {
            throw new ProductNotFoundException("No product found with ID: " + productId);
        }
    }

    public void validateOrderProductDTO(OrderProductDTO orderProductDTO) {

        if(orderProductDTO.getOrderProductId() == null) {
            throw new IllegalArgumentException("OrderProductDTO must contain a non-null orderProductId");
        } else if (orderProductDTO.getProductId() == null) {
            throw new IllegalArgumentException("OrderProductDTO must be linked to an existing Product.");
        }
        if (orderProductDTO.getQuantity() == null || orderProductDTO.getQuantity() < 0) {
            throw new IllegalArgumentException("OrderProductDTO must have a valid non-negative quantity.");
        }
        if (orderProductDTO.getPrice() == null || orderProductDTO.getPrice() < 0) {
            throw new IllegalArgumentException("OrderProductDTO must have a valid non-negative price.");
        }
        if (orderProductDTO.getVATrate() == null) {
            throw new IllegalArgumentException("OrderProductDTO must have a VatRate applied.");
        }
    }
}
