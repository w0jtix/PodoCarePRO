package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.InvalidOrderStateException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import com.podocare.PodoCareWebsite.model.order.DraftOrder;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.order.OrderProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.repo.order.DraftOrderRepo;
import com.podocare.PodoCareWebsite.repo.order.OrderRepo;
import com.podocare.PodoCareWebsite.repo.product_category.EquipmentProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.SaleProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.service.product_category.*;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.SaleProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class OrderService {

    private final OrderRepo orderRepo;
    @Autowired
    private DraftOrderRepo draftOrderRepo;
    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private EquipmentProductRepo equipmentProductRepo;
    @Autowired
    private ToolProductRepo toolProductRepo;

    @Autowired
    private SupplierService supplierService;

    @Autowired
    private OrderProductService orderProductService;

    @Autowired
    @Lazy
    private SaleProductInstanceService saleProductInstanceService;
    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    @Lazy
    private ToolProductInstanceService toolProductInstanceService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    @Lazy
    private EquipmentProductInstanceService equipmentProductInstanceService;
    @Autowired
    private EquipmentProductService equipmentProductService;

    @Autowired
    public OrderService(OrderRepo orderRepo){
        this.orderRepo = orderRepo;
    }

    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));
    }

    public List<Order> getOrders(){
        return orderRepo.findAll();
    }

    public OrderDTO getOrderDTOByOrderId(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));
        return orderToOrderDtoConversion(order);
    }

    public Order finalizeOrder(Long orderId, OrderDTO orderDTO) {

        DraftOrder existingDraftOrder = draftOrderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("DraftOrder not found with ID: " + orderId));

        if(!"DRAFT".equals(existingDraftOrder.getOrderStatus())){
            throw new InvalidOrderStateException("Cannot modify a finalized Order");
        }
        Order newOrder = new Order();
        newOrder.setOrderStatus(existingDraftOrder.getOrderStatus());
        newOrder.setOrderNumber(existingDraftOrder.getOrderNumber());

        Order orderToFinalize = orderDtoToOrderConversion(newOrder, orderDTO);
        orderToFinalize.setOrderStatus("FINALIZED");
        try {
            return orderRepo.save(orderToFinalize);
        } catch (Exception e) {
            log.error("Failed to create Order. Exception: ", e);
            throw new OrderCreationException("Failed to create Order.", e);
        }
    }

    @Transactional
    public Order updateOrder(Long orderId, OrderDTO updatedOrderDTO){
        Order existingOrder = getOrderById(orderId);

        validateOrderStatus(existingOrder);

        for(OrderProductDTO orderProductDTO : updatedOrderDTO.getOrderProductDTOList()){
            orderProductService.validateOrderProductDTO(orderProductDTO);
        }

        adjustOrderProducts(existingOrder, updatedOrderDTO);

        Order updatedOrder = orderDtoToOrderConversion(existingOrder, updatedOrderDTO);

        try {
            return orderRepo.save(updatedOrder);
        } catch (Exception e) {
            throw new OrderCreationException("Failed to update existing Order.", e);
        }
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order existingOrder = getOrderById(orderId);

        try {
            orderRepo.deleteById(orderId);
        } catch (EmptyResultDataAccessException e) {
            throw new OrderDeletionException("Order with ID " + orderId + " does not exist.", e);
        } catch (DataIntegrityViolationException e) {
            throw new OrderDeletionException("Order deletion failed due to database integrity constraints.", e);
        } catch (Exception e) {
            throw new OrderDeletionException("Failed to delete the Order", e);
        }
    }

    public Order findOrderByOrderNumber(Integer orderNumber) {
        return orderRepo.findByOrderNumber(orderNumber);
    }

    @Transactional
    private Order orderDtoToOrderConversion(Order existingOrder, OrderDTO orderDTO) {

        existingOrder.setOrderDate(orderDTO.getOrderDate());
        existingOrder.setSupplier(supplierService.findOrCreateSupplier(orderDTO.getSupplierName()));


        Double totalAmount = 0.0;
        for(OrderProductDTO orderProductDTO : orderDTO.getOrderProductDTOList()) {
            OrderProduct orderProduct = orderProductService.createOrderProduct(existingOrder, orderProductDTO);
            existingOrder.getOrderProducts().add(orderProduct);
            totalAmount += orderProduct.getPrice() * orderProduct.getQuantity();
        }

        if(orderDTO.getShippingCost() < 0) {
            log.error("Shipping cost must be greater than or equal to zero.");
            throw new IllegalArgumentException("Shipping cost must be greater than or equal to zero.");
        }
        existingOrder.setShippingCost(orderDTO.getShippingCost());
        existingOrder.setTotalAmount(totalAmount + orderDTO.getShippingCost());

        for(OrderProduct orderProduct : existingOrder.getOrderProducts()) {
            try {
                createProductInstances(orderDTO, orderProduct, orderProduct.getQuantity());
            } catch (Exception e) {
                log.error("Error creating product instances for OrderProduct: {}", orderProduct, e);
                throw new ProductInstanceCreationException("Failed to create product instances for OrderProduct ID: " + orderProduct.getId(), e);
            }
        }
        return existingOrder;
    }

    private OrderDTO orderToOrderDtoConversion(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setShippingCost(order.getShippingCost());
        if (order.getSupplier() != null) {
            orderDTO.setSupplierName(order.getSupplier().getSupplierName());
        }
        List<OrderProductDTO> orderProductDTOList = order.getOrderProducts().stream()
                .map(orderProduct -> {
                    OrderProductDTO orderProductDTO = new OrderProductDTO();
                    orderProductDTO.setQuantity(orderProduct.getQuantity());
                    orderProductDTO.setPrice(orderProduct.getPrice());
                    if(orderProduct.getSaleProduct() != null) {
                        orderProductDTO.setSaleProductId(orderProduct.getSaleProduct().getId());
                    } else if (orderProduct.getToolProduct() != null){
                        orderProductDTO.setToolProductId(orderProduct.getToolProduct().getId());
                    } else if(orderProduct.getEquipmentProduct() != null) {
                        orderProductDTO.setEquipmentProductId(orderProduct.getEquipmentProduct().getId());
                    } else {
                        throw new ProductNotFoundException("OrderProduct id not assigned.");
                    }
                    return orderProductDTO;
        }).toList();

        orderDTO.setOrderProductDTOList(orderProductDTOList);
        return orderDTO;
    }

    @Transactional(rollbackFor = {ProductInstanceCreationException.class})
    private void createProductInstances(OrderDTO orderDTO, OrderProduct orderProduct, int quantity) {
        try {
            Order order = orderProduct.getOrder();

            for (int i = 0; i < quantity; i++) {
                if (orderProduct.getSaleProduct() != null) {
                    SaleProductInstanceDTO saleProductInstanceDTO = createHelperSaleProductInstanceDtoObject(orderDTO, orderProduct);
                    SaleProductInstance saleProductInstance = saleProductInstanceService.createInstance(saleProductInstanceDTO);
                    order.getSaleProductInstances().add(saleProductInstance);
                } else if (orderProduct.getToolProduct() != null) {
                    ToolProductInstanceDTO toolProductInstanceDTO = createHelperToolProductInstanceDtoObject(orderDTO, orderProduct);
                    ToolProductInstance toolProductInstance = toolProductInstanceService.createInstance(toolProductInstanceDTO);
                    order.getToolProductInstances().add(toolProductInstance);
                } else if (orderProduct.getEquipmentProduct() != null) {
                    EquipmentProductInstanceDTO equipmentProductInstanceDTO = createHelperEquipmentProductInstanceDtoObject(orderDTO, orderProduct);
                    EquipmentProductInstance equipmentProductInstance = equipmentProductInstanceService.createInstance(equipmentProductInstanceDTO);
                    order.getEquipmentProductInstances().add(equipmentProductInstance);
                }
            }
        } catch (Exception e) {
            log.error("Failed to create instances for OrderProduct ID: {}", orderProduct.getId(), e);
            throw new ProductInstanceCreationException("Error creating product instances for OrderProduct ID: " + orderProduct.getId(), e);
        }
    }

    @Transactional(rollbackFor = {ProductInstanceDeletionException.class})
    private void deleteProductInstances(Order existingOrder) {
        try {
            if(!existingOrder.getSaleProductInstances().isEmpty()) {
                for (SaleProductInstance instance : existingOrder.getSaleProductInstances()) {
                    try {
                        saleProductInstanceService.deleteInstance(instance.getId());
                    } catch (Exception e) {
                        log.error("Failed to delete SaleProductInstance with ID: {}", instance.getId(), e);
                        throw new ProductInstanceDeletionException("Failed to delete SaleProductInstance ID: " + instance.getId(), e);

                    }
                }
                existingOrder.getSaleProductInstances().clear();
            }
            if(!existingOrder.getToolProductInstances().isEmpty()) {
                for (ToolProductInstance instance : existingOrder.getToolProductInstances()) {
                    try {
                        toolProductInstanceService.deleteInstance(instance.getId());
                    } catch (Exception e) {
                        log.error("Failed to delete ToolProductInstance with ID: {}", instance.getId(), e);
                        throw new ProductInstanceDeletionException("Failed to delete ToolProductInstance ID: " + instance.getId(), e);
                    }
                }
                existingOrder.getToolProductInstances().clear();
            }
            if(!existingOrder.getEquipmentProductInstances().isEmpty()) {
                for (EquipmentProductInstance instance : existingOrder.getEquipmentProductInstances()) {
                    try {
                        equipmentProductInstanceService.deleteInstance(instance.getId());
                    } catch (Exception e) {
                        log.error("Failed to delete EquipmentProductInstance with ID: {}", instance.getId(), e);
                        throw new ProductInstanceDeletionException("Failed to delete EquipmentProductInstance ID: " + instance.getId(), e);
                    }
                }
                existingOrder.getEquipmentProductInstances().clear();
            }
        } catch (Exception e) {
            throw new ProductInstanceDeletionException("Failed to delete product instances for order ID: " + existingOrder.getId(), e);
        }
    }


    private SaleProductInstanceDTO createHelperSaleProductInstanceDtoObject(OrderDTO orderDTO, OrderProduct orderProduct) {
        SaleProductInstanceDTO saleProductInstanceDTO = new SaleProductInstanceDTO();
        saleProductInstanceDTO.setSaleProductName(orderProduct.getSaleProduct().getProductName());
        saleProductInstanceDTO.setSupplierName(orderDTO.getSupplierName());
        saleProductInstanceDTO.setOrderNumber(Math.toIntExact(orderProduct.getOrder().getOrderNumber()));
        saleProductInstanceDTO.setPurchaseDate(orderDTO.getOrderDate());
        saleProductInstanceDTO.setPurchasePrice(orderProduct.getPrice());
        saleProductInstanceDTO.setDescription(orderProduct.getDescription());

        saleProductInstanceService.validateSaleProductInstanceDTO(saleProductInstanceDTO);

        return saleProductInstanceDTO;
    }
    private ToolProductInstanceDTO createHelperToolProductInstanceDtoObject(OrderDTO orderDTO, OrderProduct orderProduct) {
        ToolProductInstanceDTO toolProductInstanceDTO = new ToolProductInstanceDTO();
        toolProductInstanceDTO.setToolProductName(orderProduct.getToolProduct().getProductName());
        toolProductInstanceDTO.setSupplierName(orderDTO.getSupplierName());
        toolProductInstanceDTO.setOrderNumber(Math.toIntExact(orderProduct.getOrder().getOrderNumber()));
        toolProductInstanceDTO.setPurchaseDate(orderDTO.getOrderDate());
        toolProductInstanceDTO.setPurchasePrice(orderProduct.getPrice());
        toolProductInstanceDTO.setDescription(orderProduct.getDescription());
        toolProductInstanceService.validateToolProductInstanceDTO(toolProductInstanceDTO);
        return toolProductInstanceDTO;
    }
    private EquipmentProductInstanceDTO createHelperEquipmentProductInstanceDtoObject(OrderDTO orderDTO, OrderProduct orderProduct) {
        EquipmentProductInstanceDTO equipmentProductInstanceDTO = new EquipmentProductInstanceDTO();
        equipmentProductInstanceDTO.setEquipmentProductName(orderProduct.getEquipmentProduct().getProductName());
        equipmentProductInstanceDTO.setSupplierName(orderDTO.getSupplierName());
        equipmentProductInstanceDTO.setOrderNumber(Math.toIntExact(orderProduct.getOrder().getOrderNumber()));
        equipmentProductInstanceDTO.setPurchaseDate(orderDTO.getOrderDate());
        equipmentProductInstanceDTO.setPurchasePrice(orderProduct.getPrice());
        equipmentProductInstanceDTO.setDescription(orderProduct.getDescription());
        equipmentProductInstanceService.validateEquipmentProductInstanceDTO(equipmentProductInstanceDTO);
        return equipmentProductInstanceDTO;
    }

    private Long getProductId(OrderProduct orderProduct) {
        if (orderProduct.getSaleProduct() != null) {
            return orderProduct.getSaleProduct().getId();
        } else if (orderProduct.getToolProduct() != null){
            return orderProduct.getToolProduct().getId();
        } else if (orderProduct.getEquipmentProduct() != null){
            return orderProduct.getEquipmentProduct().getId();
        } else {
            throw new ProductNotFoundException("Product not found.");
        }
    }

    private void adjustOrderProducts(Order order, OrderDTO orderDTO) {
        for(OrderProductDTO orderProductDTO : orderDTO.getOrderProductDTOList()) {
            OrderProduct existingOrderProduct = order.getOrderProducts().stream()
                    .filter(op -> op.getId().equals(orderProductDTO.getOrderProductId()))
                    .findFirst()
                    .orElse(null);

            if (existingOrderProduct != null) {
                updateOrderProductInstancesQuantity(existingOrderProduct, orderProductDTO);
            } else {
                addOrderProduct(order, orderProductDTO);
            }
        }
        deleteRemovedOrderProducts(order,orderDTO);
    }

    private void updateOrderProductInstancesQuantity(OrderProduct existingOrderProduct, OrderProductDTO orderProductDTO) {
        existingOrderProduct.setQuantity(orderProductDTO.getQuantity());
        existingOrderProduct.setPrice(orderProductDTO.getPrice());
        existingOrderProduct.setDescription(orderProductDTO.getDescription());

        updateProductInstances(existingOrderProduct, orderProductDTO);
    }

    private void updateProductInstances(OrderProduct existingOrderProduct, OrderProductDTO orderProductDTO) {

        int newQuantity = orderProductDTO.getQuantity();
        int currentQuantity = existingOrderProduct.getQuantity();

        OrderDTO helperOrderDTO = orderToOrderDtoConversion(existingOrderProduct.getOrder());

        if (currentQuantity < newQuantity) {
            createProductInstances(helperOrderDTO, existingOrderProduct, newQuantity - currentQuantity);
        } else if (currentQuantity > newQuantity) {
                List<?> instancesToRemove = getValidProductInstancesToRemove(existingOrderProduct, currentQuantity - newQuantity);

                if(instancesToRemove.size() < currentQuantity - newQuantity) {
                    throw new ProductInstanceDeletionException("Cannot hardDelete instances that are sold or used");
                }
                removeProductInstances(instancesToRemove);
        }
        existingOrderProduct.setQuantity(newQuantity);
    }

    private void addOrderProduct(Order order, OrderProductDTO orderProductDTO) {
        OrderProduct newOrderProduct = orderProductService.createOrderProduct(order, orderProductDTO);
        order.getOrderProducts().add(newOrderProduct);

        OrderDTO orderDTO = orderToOrderDtoConversion(order);
        createProductInstances(orderDTO, newOrderProduct, newOrderProduct.getQuantity());
    }

    private void deleteRemovedOrderProducts(Order order, OrderDTO orderDTO) {
        List<Long> updatedOrderProductIds = orderDTO.getOrderProductDTOList().stream()
                .map(OrderProductDTO::getOrderProductId)
                .toList();

        List<OrderProduct> removedOrderProducts = order.getOrderProducts().stream()
                .filter(op -> !updatedOrderProductIds.contains(op.getId()))
                .toList();

        for( OrderProduct removedProduct : removedOrderProducts) {
            removeAllProductInstances(removedProduct);
            order.getOrderProducts().remove(removedProduct);
        }
    }

    private List<?> getValidProductInstancesToRemove(OrderProduct existingOrderProduct, int numberOfInstancesToRemove) {
        if(existingOrderProduct.getSaleProduct() != null) {
            return existingOrderProduct.getOrder().getSaleProductInstances().stream()
                    .filter(instance -> instance.getSaleProduct().equals(existingOrderProduct.getSaleProduct()))
                    .filter(instance -> !instance.getIsSold() && !instance.getIsUsed())
                    .limit(numberOfInstancesToRemove)
                    .toList();
        } else if (existingOrderProduct.getToolProduct() != null) {
            return existingOrderProduct.getOrder().getToolProductInstances().stream()
                    .filter(instances -> instances.getToolProduct().equals(existingOrderProduct.getToolProduct()))
                    .filter(instance -> !instance.getOutOfUse())
                    .limit(numberOfInstancesToRemove)
                    .toList();
        } else if (existingOrderProduct.getEquipmentProduct() != null) {
            return existingOrderProduct.getOrder().getEquipmentProductInstances().stream()
                    .filter(instances -> instances.getEquipmentProduct().equals(existingOrderProduct.getEquipmentProduct()))
                    .filter(instance -> !instance.getOutOfUse())
                    .limit(numberOfInstancesToRemove)
                    .toList();
        }
        return Collections.emptyList();
    }

    private void removeAllProductInstances(OrderProduct removedProduct) {
        removedProduct.getOrder().getSaleProductInstances().forEach(
                instance -> {
                    saleProductInstanceService.hardDeleteInstance(instance.getId());
                    removedProduct.getOrder().getSaleProductInstances().remove(instance);
                });
        removedProduct.getOrder().getToolProductInstances().forEach(
                instance -> {
                    toolProductInstanceService.hardDeleteInstance(instance.getId());
                    removedProduct.getOrder().getToolProductInstances().remove(instance);
                });
        removedProduct.getOrder().getEquipmentProductInstances().forEach(
                instance -> {
                    equipmentProductInstanceService.hardDeleteInstance(instance.getId());
                    removedProduct.getOrder().getEquipmentProductInstances().remove(instance);
                });
    }

    private void removeProductInstances(List<?> instancesToRemove) {
        if(!instancesToRemove.isEmpty()){
            if(instancesToRemove.getFirst() instanceof SaleProductInstance) {

                List<SaleProductInstance> saleProductInstances = instancesToRemove.stream().map(instance -> (SaleProductInstance) instance).toList();
                saleProductInstanceService.hardDeleteAllInstances(saleProductInstances);
                saleProductInstances.forEach(instance -> instance.getOrder().getSaleProductInstances().remove(instance));

            } else if(instancesToRemove.getFirst() instanceof ToolProductInstance) {

                List<ToolProductInstance> toolProductInstances = instancesToRemove.stream().map(instance -> (ToolProductInstance) instance).toList();
                toolProductInstanceService.hardDeleteAllInstances(toolProductInstances);
                toolProductInstances.forEach(instance -> instance.getOrder().getToolProductInstances().remove(instance));

            } else if (instancesToRemove.getFirst() instanceof EquipmentProductInstance) {

                List<EquipmentProductInstance> equipmentProductInstances = instancesToRemove.stream().map(instance -> (EquipmentProductInstance) instance).toList();
                equipmentProductInstanceService.hardDeleteAllInstances(equipmentProductInstances);
                equipmentProductInstances.forEach(instance -> instance.getOrder().getEquipmentProductInstances().remove(instance));
            }
        }
    }

    private void validateOrderStatus(Order existingOrder){
        if (!"FINALIZED".equals(existingOrder.getOrderStatus())) {
            throw new InvalidOrderStateException("Only finalized orders can be updated.");
        }
    }


}
