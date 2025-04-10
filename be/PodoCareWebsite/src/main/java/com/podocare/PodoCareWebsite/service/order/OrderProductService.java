package com.podocare.PodoCareWebsite.service.order;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderCreationException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order.OrderDeletionException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.order_product.OrderProductNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
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
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.repo.order.OrderProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.EquipmentProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.SaleProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.ToolProductRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.EquipmentProductInstanceRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.SaleProductInstanceRepo;
import com.podocare.PodoCareWebsite.repo.product_category.product_instances.ToolProductInstanceRepo;
import com.podocare.PodoCareWebsite.service.product_category.EquipmentProductService;
import com.podocare.PodoCareWebsite.service.product_category.SaleProductService;
import com.podocare.PodoCareWebsite.service.product_category.ToolProductService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.SaleProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderProductService {

    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    private EquipmentProductService equipmentProductService;
    @Autowired
    private OrderProductRepo orderProductRepo;
    @Autowired
    private SaleProductRepo saleProductRepo;
    @Autowired
    private ToolProductRepo toolProductRepo;
    @Autowired
    private EquipmentProductRepo equipmentProductRepo;
    @Autowired
    private SaleProductInstanceService saleProductInstanceService;
    @Autowired
    private ToolProductInstanceService toolProductInstanceService;
    @Autowired
    private EquipmentProductInstanceService equipmentProductInstanceService;
    @Autowired
    private SaleProductInstanceRepo saleProductInstanceRepo;
    @Autowired
    private ToolProductInstanceRepo toolProductInstanceRepo;
            @Autowired
            private EquipmentProductInstanceRepo equipmentProductInstanceRepo;

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

    public OrderProduct updateOrderProduct(OrderProduct existingOrderProduct, OrderProductDTO orderProductDTO, Date orderDate) {
        try{
            Long orderId = existingOrderProduct.getOrder().getId();
            boolean updated = false;


            if(orderProductDTO.getVATrate() != null) {
                existingOrderProduct.setVATrate(orderProductDTO.getVATrate());
                updated = true;
            }
            if(orderProductDTO.getPrice() != null) {
                existingOrderProduct.setPrice(orderProductDTO.getPrice());
                updated = true;
            }
            if(orderProductDTO.getQuantity() != null) {
                int qtyBefore = existingOrderProduct.getQuantity();
                int qtyNow  = orderProductDTO.getQuantity();

                if (qtyBefore > qtyNow) {
                    int qtyDifference = qtyBefore - qtyNow;
                    removeInstancesByOrderProduct(existingOrderProduct, qtyDifference, orderId);
                } else if (qtyBefore < qtyNow) {
                    int qtyDifference = qtyNow - qtyBefore;
                    for (int i = 0; i < qtyDifference; i++) {
                        if (existingOrderProduct.getSaleProductId() != null) {
                            SaleProductInstanceDTO saleProductInstanceDTO = new SaleProductInstanceDTO();
                            saleProductInstanceDTO.setProductId(existingOrderProduct.getSaleProductId());
                            saleProductInstanceDTO.setPurchaseDate(orderDate);
                            saleProductInstanceDTO.setSellingPrice(saleProductService.getSaleProductById(existingOrderProduct.getSaleProductId()).getSellingPrice());
                            saleProductInstanceService.createInstance(saleProductInstanceDTO);
                        } else if (existingOrderProduct.getToolProductId() != null) {
                            ToolProductInstanceDTO toolProductInstanceDTO = new ToolProductInstanceDTO();
                            toolProductInstanceDTO.setProductId(existingOrderProduct.getToolProductId());
                            toolProductInstanceDTO.setPurchaseDate(orderDate);
                            toolProductInstanceService.createInstance(toolProductInstanceDTO);
                        } else if (existingOrderProduct.getEquipmentProductId() != null) {
                            EquipmentProductInstanceDTO equipmentProductInstanceDTO = new EquipmentProductInstanceDTO();
                            equipmentProductInstanceDTO.setProductId(existingOrderProduct.getEquipmentProductId());
                            equipmentProductInstanceDTO.setPurchaseDate(orderDate);
                            equipmentProductInstanceService.createInstance(equipmentProductInstanceDTO);
                        }
                    }
                }
                existingOrderProduct.setQuantity(orderProductDTO.getQuantity());
                updated = true;
            }
            if(updated) {
                return orderProductRepo.save(existingOrderProduct);
            }
            return existingOrderProduct;
        } catch (Exception e) {
            throw new OrderCreationException("Failed to update OrderProduct.", e);
        }
    }

    public void deleteOrderProduct(Long orderProductId) {
        try {
            orderProductRepo.deleteById(orderProductId);
        } catch (Exception e) {
            throw new OrderDeletionException("Failed to delete the OrderProduct", e);
        }
    }

    public void removeInstancesByOrderProduct(OrderProduct orderProduct, int quantity, Long orderId){
        OrderProductDTO orderProductDTO = orderProductToOrderProductDTOConversion(orderProduct);
        if(orderProduct.getSaleProductId() != null) {
            Long productId = orderProduct.getSaleProductId();
            int activeInstancesQty = saleProductService.getActiveInstances(productId).size();

            if (activeInstancesQty <= quantity && activeInstancesQty > 0) {
                    saleProductInstanceService.deleteInstancesByOrderProduct(orderProductDTO, activeInstancesQty, orderId);
                } else {
                    saleProductInstanceService.deleteInstancesByOrderProduct(orderProductDTO, quantity, orderId);
                }
        } else if(orderProduct.getToolProductId() != null) {
            Long productId = orderProduct.getToolProductId();

            int activeInstancesQty = toolProductService.getActiveInstances(productId).size();
            if (activeInstancesQty <= quantity && activeInstancesQty > 0) {
                toolProductInstanceService.deleteInstancesByOrderProduct(orderProductDTO, activeInstancesQty, orderId);
            } else {
                toolProductInstanceService.deleteInstancesByOrderProduct(orderProductDTO, quantity, orderId);
            }
        } else if(orderProduct.getEquipmentProductId() != null) {
            Long productId = orderProduct.getEquipmentProductId();
            int activeInstancesQty = equipmentProductService.getActiveInstances(productId).size();

            if (activeInstancesQty <= quantity && activeInstancesQty > 0) {
                equipmentProductInstanceService.deleteInstancesByOrderProduct(orderProductDTO, activeInstancesQty, orderId);
            } else {
                equipmentProductInstanceService.deleteInstancesByOrderProduct(orderProductDTO, quantity, orderId);
            }
        }
    }

    public void manageProductDeleteStatus(Map<Long, ProductStatusSnapshot> snapshotMap) {
        for (ProductStatusSnapshot snapshot : snapshotMap.values()) {
            Long productId = snapshot.getProductId();
            int inactiveInstances = snapshot.getTotalInstancesQty() - snapshot.getTotalActiveInstancesQty();
            int remainingActiveInstances = snapshot.getTotalActiveInstancesQty() - snapshot.getTotalToDeleteQty();

            long referencesInOtherOrders = snapshot.getReferencesInOtherOrders();

            if(snapshot.getCategory().equals("Sale")) {
                if(inactiveInstances == 0 && remainingActiveInstances <= 0 && referencesInOtherOrders == 0) {
                    saleProductService.deleteSaleProduct(productId);
                } else if(remainingActiveInstances <= 0) {
                    saleProductService.softDeleteSaleProduct(productId);
                }
            } else if(snapshot.getCategory().equals("Tool")) {
                if(inactiveInstances == 0 && remainingActiveInstances <= 0 && referencesInOtherOrders == 0) {
                    toolProductService.deleteToolProduct(productId);
                } else if(remainingActiveInstances <= 0) {
                    toolProductService.softDeleteToolProduct(productId);
                }
            } else if(snapshot.getCategory().equals("Equipment")) {
                if(inactiveInstances == 0 && remainingActiveInstances <= 0 && referencesInOtherOrders == 0) {
                    equipmentProductService.deleteEquipmentProduct(productId);
                } else if(remainingActiveInstances <= 0) {
                    equipmentProductService.softDeleteEquipmentProduct(productId);
                }
            } else {
            throw new OrderCreationException("Couldn't define Product Category");
        }
    }




    }


    public OrderProduct orderProductDtoToOrderProductConversion(Order order, OrderProductDTO orderProductDTO){
        OrderProduct orderProduct = new OrderProduct();
        orderProduct.setOrder(order);
        orderProduct.setPrice(orderProductDTO.getPrice());
        orderProduct.setVATrate(orderProductDTO.getVATrate());
        orderProduct.setQuantity(orderProductDTO.getQuantity());
        defineAndSetProductType(orderProduct, orderProductDTO);
        return orderProduct;
    }

    public OrderProductDTO orderProductToOrderProductDTOConversion(OrderProduct orderProduct) {
        OrderProductDTO orderProductDTO = new OrderProductDTO();
        orderProductDTO.setOrderProductId(orderProduct.getId());
        orderProductDTO.setQuantity(orderProduct.getQuantity());
        orderProductDTO.setPrice(orderProduct.getPrice());
        orderProductDTO.setVATrate(orderProduct.getVATrate());
        orderProductDTO.setOrderId(orderProduct.getOrder().getId());
        if(orderProduct.getSaleProductId() != null) {
            SaleProduct saleProduct = saleProductService.getSaleProductById(orderProduct.getSaleProductId());
            orderProductDTO.setProductId(orderProduct.getSaleProductId());
            orderProductDTO.setProductName(saleProduct.getProductName());
            orderProductDTO.setCategory(saleProduct.getCategory());
        } else if (orderProduct.getToolProductId() != null){
            ToolProduct toolProduct = toolProductService.getToolProductById(orderProduct.getToolProductId());
            orderProductDTO.setProductId(orderProduct.getToolProductId());
            orderProductDTO.setProductName(toolProduct.getProductName());
            orderProductDTO.setCategory(toolProduct.getCategory());
        } else if(orderProduct.getEquipmentProductId() != null) {
            EquipmentProduct equipmentProduct = equipmentProductService.getEquipmentProductById(orderProduct.getEquipmentProductId());
            orderProductDTO.setProductId(orderProduct.getEquipmentProductId());
            orderProductDTO.setProductName(equipmentProduct.getProductName());
            orderProductDTO.setCategory(equipmentProduct.getCategory());
        } else {
            throw new ProductNotFoundException("OrderProduct productId not assigned.");
        }
        return orderProductDTO;
    }

    public Long defineProductId(OrderProduct orderProduct) {
        Long productId = null;
        if(orderProduct.getSaleProductId() != null) {
            productId = orderProduct.getSaleProductId();
        } else if(orderProduct.getToolProductId() != null){
            productId = orderProduct.getToolProductId();
        } else if(orderProduct.getEquipmentProductId() != null) {
            productId = orderProduct.getEquipmentProductId();
        }
        return productId;
    }

    private void defineAndSetProductType(OrderProduct orderProduct, OrderProductDTO orderProductDTO){
        Long productId = orderProductDTO.getProductId();

        if (productId == null) {
            throw new ProductNotFoundException("Product ID cannot be null.");
        }

        if (saleProductRepo.existsById(productId)) {
            orderProduct.setSaleProductId(productId);
        } else if (toolProductRepo.existsById(productId)) {
            orderProduct.setToolProductId(productId);
        } else if (equipmentProductRepo.existsById(productId)) {
            orderProduct.setEquipmentProductId(productId);
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
