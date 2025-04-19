package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order_product.OrderProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product_instance.ProductInstanceDeletionException;
import com.podocare.PodoCareWebsite.model.VatRate;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderFilterDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.ProductStatusSnapshot;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.model.order.OrderProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import com.podocare.PodoCareWebsite.repo.order.OrderProductRepo;
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
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.BiConsumer;

@Slf4j
@Service
public class OrderService {

    private final OrderRepo orderRepo;

    @Autowired
    private SupplierService supplierService;
    @Autowired
    private OrderProductService orderProductService;
    @Autowired
    private SaleProductInstanceService saleProductInstanceService;
    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    private EquipmentProductService equipmentProductService;

    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private ToolProductRepo toolProductRepo;
    @Autowired
    private EquipmentProductRepo equipmentProductRepo;
    @Autowired
    private ToolProductInstanceService toolProductInstanceService;
    @Autowired
    private EquipmentProductInstanceService equipmentProductInstanceService;
    @Autowired
    private OrderProductRepo orderProductRepo;


    @Autowired
    public OrderService(OrderRepo orderRepo){
        this.orderRepo = orderRepo;
    }

    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with ID: " + orderId));
    }

    public List<OrderDTO> getOrders(){
        List<Order> orders = orderRepo.findAll();
        return orders.stream()
                .map(this::orderToOrderDtoConversion).toList();
    }

    public List<OrderDTO> getFilteredOrders(OrderFilterDTO orderFilterDTO) {

        List<OrderDTO> filteredOrderBySupplier;

        if(orderFilterDTO.getSupplierIds() == null || orderFilterDTO.getSupplierIds().isEmpty()) {
            filteredOrderBySupplier = getOrders();
        } else {
            filteredOrderBySupplier = filterOrdersBySupplier(orderFilterDTO.getSupplierIds());
        }

        Date dateFrom = orderFilterDTO.getDateFrom();
        Date dateTo = orderFilterDTO.getDateTo();

        if (dateFrom == null && dateTo == null) {
            return filteredOrderBySupplier;
        }

        return filteredOrderBySupplier.stream()
                .filter(orderDTO -> isDateInRange(orderDTO.getOrderDate(), dateFrom, dateTo))
                .toList();
    }


    private List<OrderDTO> filterOrdersBySupplier(List<Long> supplierIds){
            List<Order> filteredOrders = orderRepo.findOrdersBySupplierIds(supplierIds);

            return filteredOrders.stream()
                    .map(this::orderToOrderDtoConversion).toList();
    }

    private boolean isDateInRange(Date orderDate, Date dateFrom, Date dateTo) {
        if (orderDate == null) {
            return false;
        }

        if (dateTo != null) {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(dateTo);
            calendar.add(Calendar.DAY_OF_MONTH, 1);
            dateTo = calendar.getTime();
        }

        boolean afterStart = (dateFrom == null || !orderDate.before(dateFrom));
        boolean beforeEnd = (dateTo == null || !orderDate.after(dateTo));

        return afterStart && beforeEnd;
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

    private Map<Long, ProductStatusSnapshot> manageProductStatusSnapshot (OrderProduct orderProduct, Map<Long, ProductStatusSnapshot> productSnapshotMap){
        Long productId = orderProductService.defineProductId(orderProduct);
        int quantityToDelete = orderProduct.getQuantity();
        Long orderId = orderProduct.getOrder().getId();

        ProductStatusSnapshot snapshot = productSnapshotMap.getOrDefault(productId, new ProductStatusSnapshot());
        snapshot.setProductId(productId);
        snapshot.setTotalToDeleteQty(snapshot.getTotalToDeleteQty() + quantityToDelete);

        if(orderProduct.getSaleProductId() != null) {
            SaleProduct saleProduct = saleProductService.getSaleProductById(orderProduct.getSaleProductId());
            snapshot.setTotalInstancesQty(saleProduct.getProductInstances().size());
            snapshot.setTotalActiveInstancesQty(saleProductService.getActiveInstances(productId).size());
            snapshot.setReferencesInThisOrder(orderProductRepo.countSaleProductInOrder(productId, orderId));
            snapshot.setReferencesInOtherOrders(orderProductRepo.countOrdersWithSaleProductReferenceExceptOrder(productId, orderId));
            snapshot.setCategory("Sale");
        } else if(orderProduct.getToolProductId() != null) {
            ToolProduct toolProduct = toolProductService.getToolProductById(orderProduct.getToolProductId());
            snapshot.setTotalInstancesQty(toolProduct.getProductInstances().size());
            snapshot.setTotalActiveInstancesQty(toolProductService.getActiveInstances(productId).size());
            snapshot.setReferencesInThisOrder(orderProductRepo.countToolProductInOrder(productId, orderId));
            snapshot.setReferencesInOtherOrders(orderProductRepo.countOrdersWithToolProductReferenceExceptOrder(productId, orderId));
            snapshot.setCategory("Tool");
        } else if(orderProduct.getEquipmentProductId() != null) {
            EquipmentProduct equipmentProduct = equipmentProductService.getEquipmentProductById(orderProduct.getEquipmentProductId());
            snapshot.setTotalInstancesQty(equipmentProduct.getProductInstances().size());
            snapshot.setTotalActiveInstancesQty(equipmentProductService.getActiveInstances(productId).size());
            snapshot.setReferencesInThisOrder(orderProductRepo.countEquipmentProductInOrder(productId, orderId));
            snapshot.setReferencesInOtherOrders(orderProductRepo.countOrdersWithEquipmentProductReferenceExceptOrder(productId, orderId));
            snapshot.setCategory("Equipment");
        }

        productSnapshotMap.put(productId, snapshot);
        return productSnapshotMap;
    }

    @Transactional
    public Order updateOrder(Long orderId, OrderDTO updatedOrderDTO){
        try{
            Order existingOrder = getOrderById(orderId);
            Date orderDate = updatedOrderDTO.getOrderDate() != null ? updatedOrderDTO.getOrderDate() : existingOrder.getOrderDate();
            boolean updated = false;

            if(updatedOrderDTO.getSupplierId() != null) {
                existingOrder.setSupplier(supplierService.getSupplierById(updatedOrderDTO.getSupplierId()));
                updated = true;
            }
            if(updatedOrderDTO.getOrderDate() != null) {
                existingOrder.setOrderDate(updatedOrderDTO.getOrderDate());
                updated = true;
            }
            if(updatedOrderDTO.getShippingCost() != null) {
                existingOrder.setShippingCost(updatedOrderDTO.getShippingCost());
                updated = true;
            }
            if(updatedOrderDTO.getRemovedOrderProducts() != null && !updatedOrderDTO.getRemovedOrderProducts().isEmpty()) {
                List<OrderProduct> orderProductsToRemove = existingOrder.getOrderProducts().stream()
                        .filter(op -> updatedOrderDTO.getRemovedOrderProducts().contains(op.getId()))
                        .toList();

                Map<Long, ProductStatusSnapshot> productSnapshotMap = new HashMap<>();

                for (OrderProduct orderProduct : orderProductsToRemove) {
                    manageProductStatusSnapshot(orderProduct, productSnapshotMap);
                    orderProductService.removeInstancesByOrderProduct(orderProduct, orderProduct.getQuantity(), orderId);
                }

                for (OrderProduct orderProduct : orderProductsToRemove) {
                    orderProductService.deleteOrderProduct(orderProduct.getId());
                }

                existingOrder.getOrderProducts().removeAll(orderProductsToRemove);
                updated = true;
                orderProductService.manageProductDeleteStatus(productSnapshotMap);
            }
            if(updatedOrderDTO.getEditedOrderProducts() != null && !updatedOrderDTO.getEditedOrderProducts().isEmpty()) {
                for(OrderProductDTO editedOrderProductDTO : updatedOrderDTO.getEditedOrderProducts()) {
                    OrderProduct existingOrderProduct = existingOrder.getOrderProducts().stream()
                            .filter(op -> op.getId().equals(editedOrderProductDTO.getOrderProductId()))
                            .findFirst()
                            .orElseThrow(() -> new OrderProductNotFoundException("OrderProduct not found with ID: " + editedOrderProductDTO.getOrderProductId()));
                    orderProductService.updateOrderProduct(existingOrderProduct, editedOrderProductDTO, orderDate);
                }
                updated = true;
            }
            if(updatedOrderDTO.getAddedOrderProducts() != null && !updatedOrderDTO.getAddedOrderProducts().isEmpty()) {
                for(OrderProductDTO orderProductDTO : updatedOrderDTO.getAddedOrderProducts()) {
                    OrderProduct orderProduct = new OrderProduct();
                    orderProduct = orderProductService.createOrderProduct(existingOrder, orderProductDTO);
                    createProductInstances(updatedOrderDTO, orderProduct, orderProduct.getQuantity());
                    existingOrder.getOrderProducts().add(orderProduct);
                }
                updated = true;
            }
            if(updatedOrderDTO.getOrderProductDTOList() != null && !updatedOrderDTO.getOrderProductDTOList().isEmpty()){
                existingOrder = calculateOrderCosts(existingOrder, updatedOrderDTO, "Edit");
                updated = true;
            }

            if(updated) {
                return orderRepo.save(existingOrder);
            }
            return existingOrder;
        } catch (Exception e) {
            e.printStackTrace();
            throw new OrderCreationException("Failed to update existing Order.", e);
        }
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order existingOrder = getOrderById(orderId);
        List<OrderProduct> orderProductsList = existingOrder.getOrderProducts();
        Map<Long, ProductStatusSnapshot> productSnapshotMap = new HashMap<>();
        try {
            for(OrderProduct orderProduct : orderProductsList) {
                manageProductStatusSnapshot(orderProduct, productSnapshotMap);
                orderProductService.removeInstancesByOrderProduct(orderProduct, orderProduct.getQuantity(), orderId);

            }
            for(OrderProduct orderProduct : orderProductsList) {
                orderProductService.deleteOrderProduct(orderProduct.getId());
            }
            existingOrder.getOrderProducts().removeAll(orderProductsList);

            orderProductService.manageProductDeleteStatus(productSnapshotMap);
            orderRepo.deleteById(orderId);
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

        existingOrder = calculateOrderCosts(existingOrder, orderDTO, action);

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

    private Order calculateOrderCosts(Order existingOrder, OrderDTO orderDTO, String action){
        Double totalValue = 0.0;
        Double totalNet = 0.0;
        Double totalVat = 0.0;
        for(OrderProductDTO orderProductDTO : orderDTO.getOrderProductDTOList()) {
            OrderProduct orderProduct = new OrderProduct();
            if(action.equals("Edit")) {
                orderProduct = orderProductService.orderProductDtoToOrderProductConversion(existingOrder, orderProductDTO);
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

        double shippingCostNet = 0;

        if(action.equals("Create")) {
            if (orderDTO.getShippingCost() < 0) {
                log.error("Shipping cost must be greater than or equal to zero.");
                throw new IllegalArgumentException("Shipping cost must be greater than or equal to zero.");
            }
            shippingCostNet = orderDTO.getShippingCost()/ (1 +  VatRate.VAT_23.getRate() / 100);
            existingOrder.setShippingCost(orderDTO.getShippingCost());
            existingOrder.setShippingVatRate(VatRate.VAT_23);
            existingOrder.setTotalValue(totalValue + orderDTO.getShippingCost());
            existingOrder.setTotalVat(totalVat + orderDTO.getShippingCost() - shippingCostNet);
        } else if(action.equals("Edit")) {
            shippingCostNet = existingOrder.getShippingCost()/ (1 +  VatRate.VAT_23.getRate() / 100);
            existingOrder.setTotalValue(totalValue + existingOrder.getShippingCost());
            existingOrder.setTotalVat(totalVat + existingOrder.getShippingCost() - shippingCostNet);
        }
        existingOrder.setTotalNet(totalNet +  shippingCostNet);

        return existingOrder;
    }

    private OrderDTO orderToOrderDtoConversion(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setOrderId(order.getId());
        orderDTO.setShippingCost(order.getShippingCost());
        orderDTO.setOrderDate(order.getOrderDate());
        if (order.getSupplier() != null) {
            orderDTO.setSupplierId(order.getSupplier().getId());
            orderDTO.setSupplierName(order.getSupplier().getSupplierName());
        }
        orderDTO.setOrderNumber(order.getOrderNumber());
        orderDTO.setShippingVatRate(order.getShippingVatRate());
        orderDTO.setTotalNet(order.getTotalNet());
        orderDTO.setTotalVat(order.getTotalVat());
        orderDTO.setTotalValue(order.getTotalValue());
        List<OrderProductDTO> orderProductDTOList = order.getOrderProducts().stream()
                .map(orderProduct -> orderProductService.orderProductToOrderProductDTOConversion(orderProduct)).toList();

        orderDTO.setOrderProductDTOList(orderProductDTOList);
        return orderDTO;
    }

    @Transactional(rollbackFor = {ProductInstanceCreationException.class})
    private void createProductInstances(OrderDTO orderDTO, OrderProduct orderProduct, int quantity) {
        try {
            Date orderDate =orderDTO.getOrderDate() != null ? orderDTO.getOrderDate() : orderProduct.getOrder().getOrderDate();

            for (int i = 0; i < quantity; i++) {
                if (orderProduct.getSaleProductId() != null) {
                    SaleProductInstanceDTO saleProductInstanceDTO = createHelperSaleProductInstanceDtoObject(orderDate, orderProduct);
                    saleProductInstanceService.createInstance(saleProductInstanceDTO);
                } else if (orderProduct.getToolProductId() != null) {
                    ToolProductInstanceDTO toolProductInstanceDTO = createHelperToolProductInstanceDtoObject(orderDate, orderProduct);
                    toolProductInstanceService.createInstance(toolProductInstanceDTO);
                } else if (orderProduct.getEquipmentProductId() != null) {
                    EquipmentProductInstanceDTO equipmentProductInstanceDTO = createHelperEquipmentProductInstanceDtoObject(orderDate, orderProduct);
                    equipmentProductInstanceService.createInstance(equipmentProductInstanceDTO);
                }
            }
        } catch (Exception e) {
            log.error("Failed to create instances for OrderProduct ID: {}", orderProduct.getId(), e);
            throw new ProductInstanceCreationException("Error creating product instances for OrderProduct ID: " + orderProduct.getId(), e);
        }
    }


    private SaleProductInstanceDTO createHelperSaleProductInstanceDtoObject(Date orderDate, OrderProduct orderProduct) {
        SaleProductInstanceDTO saleProductInstanceDTO = new SaleProductInstanceDTO();
        saleProductInstanceDTO.setProductId(orderProduct.getSaleProductId());
        saleProductInstanceDTO.setPurchaseDate(orderDate);
        saleProductInstanceDTO.setSellingPrice(saleProductService.getSaleProductById(orderProduct.getSaleProductId()).getSellingPrice());

        return saleProductInstanceDTO;
    }
    private ToolProductInstanceDTO createHelperToolProductInstanceDtoObject(Date orderDate, OrderProduct orderProduct) {
        ToolProductInstanceDTO toolProductInstanceDTO = new ToolProductInstanceDTO();
        toolProductInstanceDTO.setProductId(orderProduct.getToolProductId());
        toolProductInstanceDTO.setPurchaseDate(orderDate);

        return toolProductInstanceDTO;
    }
    private EquipmentProductInstanceDTO createHelperEquipmentProductInstanceDtoObject(Date orderDate, OrderProduct orderProduct) {
        EquipmentProductInstanceDTO equipmentProductInstanceDTO = new EquipmentProductInstanceDTO();
        equipmentProductInstanceDTO.setProductId(orderProduct.getEquipmentProductId());
        equipmentProductInstanceDTO.setPurchaseDate(orderDate);

        return equipmentProductInstanceDTO;
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
