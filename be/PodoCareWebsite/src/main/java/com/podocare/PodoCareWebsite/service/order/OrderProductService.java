package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderCreationException;
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

    public OrderProduct createOrderProduct(Order order, OrderProductDTO orderProductDTO) {
        if (order == null) {
            log.error("Failed to create OrderProduct: 'order' is null.");
            throw new IllegalArgumentException("Order cannot be null.");
        }
        if (orderProductDTO == null) {
            log.error("Failed to create OrderProduct: 'orderProductDTO' is null.");
            throw new IllegalArgumentException("OrderProductDTO cannot be null.");
        }
        if (orderProductDTO.getPrice() <= 0) {
            log.error("Failed to create OrderProduct: Invalid price {}",
                    orderProductDTO.getPrice());
            throw new IllegalArgumentException("Price must be greater than zero.");
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

    private OrderProduct orderProductDtoToOrderProductConversion(Order order, OrderProductDTO orderProductDTO){
        OrderProduct orderProduct = new OrderProduct();
        orderProduct.setOrder(order);
        orderProduct.setPrice(orderProductDTO.getPrice());
        orderProduct.setQuantity(orderProductDTO.getQuantity());
        orderProduct.setDescription(orderProductDTO.getDescription());
        defineAndSetProductType(orderProduct, orderProductDTO);
        orderProductRepo.save(orderProduct);
        return orderProduct;
    }

    private void defineAndSetProductType(OrderProduct orderProduct, OrderProductDTO orderProductDTO){

        if(orderProductDTO.getSaleProductId() != null) {
            orderProduct.setSaleProduct(saleProductRepo.findById(orderProductDTO.getSaleProductId()).get());
        } else if (orderProductDTO.getToolProductId() != null){
            orderProduct.setToolProduct(toolProductRepo.findById(orderProductDTO.getToolProductId()).get());
        } else if (orderProductDTO.getEquipmentProductId() != null) {
            orderProduct.setEquipmentProduct(equipmentProductRepo.findById(orderProductDTO.getEquipmentProductId()).get());
        } else {
            throw new ProductNotFoundException("Product not found.");
        }
    }

    public void validateOrderProductDTO(OrderProductDTO orderProductDTO) {

        if(orderProductDTO.getOrderProductId() == null) {
            throw new IllegalArgumentException("OrderProductDTO must contain a non-null orderProductId");
        } else if (orderProductDTO.getSaleProductId() == null && orderProductDTO.getToolProductId() == null && orderProductDTO.getEquipmentProductId() == null) {
            throw new IllegalArgumentException("OrderProductDTO must be linked to an existing Product.");
        }
        if (orderProductDTO.getQuantity() == null || orderProductDTO.getQuantity() < 0) {
            throw new IllegalArgumentException("OrderProductDTO must have a valid non-negative quantity.");
        }
        if (orderProductDTO.getPrice() == null || orderProductDTO.getPrice() < 0) {
            throw new IllegalArgumentException("OrderProductDTO must have a valid non-negative price.");
        }
    }
}
