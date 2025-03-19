package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.model.VatRate;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.order.OrderProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class OrderService {

    private final OrderRepo orderRepo;

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

    @Transactional(rollbackFor = Exception.class)
    public Order createOrder(OrderDTO orderDTO) {

        try {
            Order newOrder = new Order();
            newOrder.setOrderNumber(generateOrderNumber());
            //doubled setSupplier (happens in orderDTOToOrderConversion as well), but has to happen b4 saving newOrder(supplier -> nullable=false)
            newOrder.setSupplier(supplierService.findOrCreateSupplier(supplierService.getSupplierById(orderDTO.getSupplierId()).getSupplierName()));

            Order savedOrder = orderRepo.save(newOrder);
            Order orderToFinalize = orderDtoToOrderConversion(savedOrder, orderDTO, "Create");

            return orderRepo.save(orderToFinalize);
        } catch (Exception e) {
            log.error("Failed to create Order. Exception: ", e);
            throw new OrderCreationException("Failed to create Order.", e);
        }
    }

    @Transactional
    public Order updateOrder(Long orderId, OrderDTO updatedOrderDTO){
        Order existingOrder = getOrderById(orderId);

        for(OrderProductDTO orderProductDTO : updatedOrderDTO.getOrderProductDTOList()){
            orderProductService.validateOrderProductDTO(orderProductDTO);
        }

        adjustOrderProducts(existingOrder, updatedOrderDTO);

        Order updatedOrder = orderDtoToOrderConversion(existingOrder, updatedOrderDTO, "Edit");

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
    private Order orderDtoToOrderConversion(Order existingOrder, OrderDTO orderDTO, String action) {

        existingOrder.setOrderDate(orderDTO.getOrderDate());
        existingOrder.setSupplier(supplierService.findOrCreateSupplier(supplierService.getSupplierById(orderDTO.getSupplierId()).getSupplierName()));

        Double totalValue = 0.0;
        Double totalNet = 0.0;
        Double totalVat = 0.0;
        for(OrderProductDTO orderProductDTO : orderDTO.getOrderProductDTOList()) {
            OrderProduct orderProduct = new OrderProduct();
            if(action.equals("Edit")) {
                orderProduct = orderProductService.getOrderProductById(orderProductDTO.getId());
            } else if ( action.equals("Create")) {
                orderProduct = orderProductService.createOrderProduct(existingOrder, orderProductDTO);
                existingOrder.getOrderProducts().add(orderProduct);
            }
            totalValue += orderProduct.getPrice() * orderProduct.getQuantity();
            double vatRate = orderProduct.getVATrate().isNumeric() ? (Double) orderProduct.getVATrate().getRate() : 0.0;
            double netPrice = BigDecimal.valueOf(orderProduct.getPrice() / (1 + vatRate / 100))
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
            totalNet += netPrice * orderProduct.getQuantity();
            double productVat = orderProduct.getPrice() - netPrice;
            totalVat += productVat * orderProduct.getQuantity();
        }

        if(orderDTO.getShippingCost() < 0) {
            log.error("Shipping cost must be greater than or equal to zero.");
            throw new IllegalArgumentException("Shipping cost must be greater than or equal to zero.");
        }

        double shippingCostNet = orderDTO.getShippingCost()/ (1 +  VatRate.VAT_23.getRate() / 100);

        existingOrder.setShippingCost(orderDTO.getShippingCost());
        existingOrder.setShippingVatRate(VatRate.VAT_23);
        existingOrder.setTotalValue(totalValue + orderDTO.getShippingCost());
        existingOrder.setTotalNet(totalNet +  shippingCostNet);
        existingOrder.setTotalVat(totalVat + orderDTO.getShippingCost() - shippingCostNet);

        if(action.equals("Create") ) {
            for (OrderProduct orderProduct : existingOrder.getOrderProducts()) {
                try {
                    createProductInstances(orderDTO, orderProduct, orderProduct.getQuantity());
                } catch (Exception e) {
                    log.error("Error creating product instances for OrderProduct: {}", orderProduct, e);
                    throw new ProductInstanceCreationException("Failed to create product instances for OrderProduct ID: " + orderProduct.getId(), e);
                }
            }
        }
        return existingOrder;
    }

    private OrderDTO orderToOrderDtoConversion(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setShippingCost(order.getShippingCost());
        if (order.getSupplier() != null) {
            orderDTO.setSupplierId(order.getSupplier().getId());
        }
        List<OrderProductDTO> orderProductDTOList = order.getOrderProducts().stream()
                .map(orderProduct -> {
                    OrderProductDTO orderProductDTO = new OrderProductDTO();
                    orderProductDTO.setQuantity(orderProduct.getQuantity());
                    orderProductDTO.setPrice(orderProduct.getPrice());
                    if(orderProduct.getSaleProduct() != null) {
                        orderProductDTO.setId(orderProduct.getSaleProduct().getId());
                    } else if (orderProduct.getToolProduct() != null){
                        orderProductDTO.setId(orderProduct.getToolProduct().getId());
                    } else if(orderProduct.getEquipmentProduct() != null) {
                        orderProductDTO.setId(orderProduct.getEquipmentProduct().getId());
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

                } else if (orderProduct.getToolProduct() != null) {
                    ToolProductInstanceDTO toolProductInstanceDTO = createHelperToolProductInstanceDtoObject(orderDTO, orderProduct);
                    ToolProductInstance toolProductInstance = toolProductInstanceService.createInstance(toolProductInstanceDTO);

                } else if (orderProduct.getEquipmentProduct() != null) {
                    EquipmentProductInstanceDTO equipmentProductInstanceDTO = createHelperEquipmentProductInstanceDtoObject(orderDTO, orderProduct);
                    EquipmentProductInstance equipmentProductInstance = equipmentProductInstanceService.createInstance(equipmentProductInstanceDTO);

                }
            }
        } catch (Exception e) {
            log.error("Failed to create instances for OrderProduct ID: {}", orderProduct.getId(), e);
            throw new ProductInstanceCreationException("Error creating product instances for OrderProduct ID: " + orderProduct.getId(), e);
        }
    }


    private SaleProductInstanceDTO createHelperSaleProductInstanceDtoObject(OrderDTO orderDTO, OrderProduct orderProduct) {
        SaleProductInstanceDTO saleProductInstanceDTO = new SaleProductInstanceDTO();
        saleProductInstanceDTO.setProductId(orderProduct.getSaleProduct().getId());
        saleProductInstanceDTO.setPurchaseDate(orderDTO.getOrderDate());

        return saleProductInstanceDTO;
    }
    private ToolProductInstanceDTO createHelperToolProductInstanceDtoObject(OrderDTO orderDTO, OrderProduct orderProduct) {
        ToolProductInstanceDTO toolProductInstanceDTO = new ToolProductInstanceDTO();
        toolProductInstanceDTO.setProductId(orderProduct.getToolProduct().getId());
        toolProductInstanceDTO.setPurchaseDate(orderDTO.getOrderDate());

        return toolProductInstanceDTO;
    }
    private EquipmentProductInstanceDTO createHelperEquipmentProductInstanceDtoObject(OrderDTO orderDTO, OrderProduct orderProduct) {
        EquipmentProductInstanceDTO equipmentProductInstanceDTO = new EquipmentProductInstanceDTO();
        equipmentProductInstanceDTO.setProductId(orderProduct.getEquipmentProduct().getId());
        equipmentProductInstanceDTO.setPurchaseDate(orderDTO.getOrderDate());

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
                orderProductService.updateOrderProduct(existingOrderProduct.getId(), orderProductDTO);
            } else {
                addOrderProduct(order, orderProductDTO);
            }
        }
        deleteRemovedOrderProducts(order,orderDTO);
    }

    private void addOrderProduct(Order order, OrderProductDTO orderProductDTO) {
        OrderProduct newOrderProduct = orderProductService.createOrderProduct(order, orderProductDTO);
        order.getOrderProducts().add(newOrderProduct);
    }

    private void deleteRemovedOrderProducts(Order order, OrderDTO orderDTO) {
        List<Long> updatedOrderProductIds = orderDTO.getOrderProductDTOList().stream()
                .map(OrderProductDTO::getOrderProductId)
                .toList();

        List<OrderProduct> removedOrderProducts = order.getOrderProducts().stream()
                .filter(op -> !updatedOrderProductIds.contains(op.getId()))
                .toList();

        for(OrderProduct removedProduct : removedOrderProducts) {
            orderProductService.deleteOrderProduct(removedProduct.getId());
        }
    }

    private List<?> getValidProductInstancesToRemove(OrderProduct existingOrderProduct, int numberOfInstancesToRemove) {
        Date orderDate = existingOrderProduct.getOrder().getOrderDate();

        if(existingOrderProduct.getSaleProduct() != null) {
            List<SaleProductInstance> activeInstances = saleProductInstanceService.getClosestDateSortedAllInstanceList(existingOrderProduct.getSaleProduct().getId(), orderDate);
            return activeInstances.subList(0,numberOfInstancesToRemove);
        } else if (existingOrderProduct.getToolProduct() != null) {
            List<ToolProductInstance> activeInstances = toolProductInstanceService.getClosestDateSortedAllInstanceList(existingOrderProduct.getToolProduct().getId(), orderDate);
            return activeInstances.subList(0,numberOfInstancesToRemove);
        } else if (existingOrderProduct.getEquipmentProduct() != null) {
            List<EquipmentProductInstance> activeInstances = equipmentProductInstanceService.getClosestDateSortedActiveInstanceList(existingOrderProduct.getEquipmentProduct().getId(), orderDate);
            return activeInstances.subList(0,numberOfInstancesToRemove);
        }
        return Collections.emptyList();
    }

    private void removeProductInstances(List<?> instancesToRemove) {
        if (instancesToRemove != null && !instancesToRemove.isEmpty()) {

            for (Object instance : instancesToRemove) {
                if (instance instanceof SaleProductInstance saleProductInstance) {
                    saleProductInstanceService.deleteInstance(saleProductInstance.getId());

                } else if (instance instanceof ToolProductInstance toolProductInstance) {
                    toolProductInstanceService.deleteInstance(toolProductInstance.getId());

                } else if (instance instanceof EquipmentProductInstance equipmentProductInstance) {
                    equipmentProductInstanceService.deleteInstance(equipmentProductInstance.getId());

                }
            }
        }
    }

    private long generateOrderNumber() {
        try {
            Optional<Order> lastOrder = orderRepo.findTopByOrderByOrderNumberDesc();
            return lastOrder.map(order -> order.getOrderNumber() + 1).orElse(1L);
        } catch (DataAccessException e) {
            throw new OrderCreationException("Failed to generate order number.", e);
        }
    }


}
