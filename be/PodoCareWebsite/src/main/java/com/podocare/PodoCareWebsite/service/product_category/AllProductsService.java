package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.exceptions.specific_exceptions.product.ProductNotFoundException;
import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import com.podocare.PodoCareWebsite.model.order.DTOs.ProductCreationDTO;
import com.podocare.PodoCareWebsite.model.order.OrderProductValidator;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.EquipmentProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.SaleProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.DTOs.ToolProductDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ProductFilterDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.EquipmentProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.SaleProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.DTOs.ToolProductInstanceDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.EquipmentProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.SaleProductInstanceService;
import com.podocare.PodoCareWebsite.service.product_category.product_instances.ToolProductInstanceService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AllProductsService {
    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    private EquipmentProductService equipmentProductService;
    @Autowired
    private SaleProductInstanceService saleProductInstanceService;
    @Autowired
    private ToolProductInstanceService toolProductInstanceService;
    @Autowired
    private EquipmentProductInstanceService equipmentProductInstanceService;


    public List<Object>  getAllProducts() {
        List<Object> productsList = new ArrayList<>();
        productsList.addAll(saleProductService.getSaleProducts());
        productsList.addAll(toolProductService.getToolProducts());
        productsList.addAll(equipmentProductService.getEquipmentProducts());
        return productsList;
    }

    public List<Object> getFilteredProducts(ProductFilterDTO filter) {
        List<Object> filteredAllProductsByType = filterAllProductByProductType(filter.getProductTypes());

        if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
            filteredAllProductsByType = searchProductsByKeyword(filteredAllProductsByType, filter.getKeyword());
        }

        if(filter.getSelectedIds() == null || filter.getSelectedIds().isEmpty()) {
            return filteredAllProductsByType;
        } else {
            return filterProductsByBrands(filteredAllProductsByType, filter.getSelectedIds());
        }
      }

    public OrderProductValidator validateProducts(List<OrderProductDTO> orderProductDTOList) {

        OrderProductValidator orderProductValidator = new OrderProductValidator();

        for(OrderProductDTO orderProductDTO : orderProductDTOList) {
            String productName = orderProductDTO.getProductName();

            if (saleProductService.saleProductAlreadyExists(productName)) {
                SaleProduct saleProduct = saleProductService.findBySaleProductName(productName);
                orderProductDTO.setProductId(saleProduct.getId());
                orderProductValidator.getExistingProducts().add(orderProductDTO);
            } else if (toolProductService.toolProductAlreadyExists(productName)) {
                ToolProduct toolProduct = toolProductService.findByToolProductName(productName);
                orderProductDTO.setProductId(toolProduct.getId());
                orderProductValidator.getExistingProducts().add(orderProductDTO);
            } else if (equipmentProductService.equipmentProductAlreadyExists(productName)) {
                EquipmentProduct equipmentProduct = equipmentProductService.findByEquipmentProductName(productName);
                orderProductDTO.setProductId(equipmentProduct.getId());
                orderProductValidator.getExistingProducts().add(orderProductDTO);
            } else {
                orderProductValidator.getNonExistingProducts().add(orderProductDTO);
            }
        }
        return orderProductValidator;
    }

    @Transactional
    public List<Object> createProducts(List<ProductCreationDTO> productsToCreateList) {
        List<Object> createdProducts = new ArrayList<>();

        for(ProductCreationDTO productCreationDTO : productsToCreateList) {
            if(Objects.equals(productCreationDTO.getCategory(), "Sale")) {
                SaleProductDTO saleProductDTO = createSaleProductDTO(productCreationDTO);
                SaleProduct newSaleProduct = saleProductService.createSaleProduct(saleProductDTO);
                createdProducts.add(newSaleProduct);
            } else if (Objects.equals(productCreationDTO.getCategory(), "Tool")) {
                ToolProductDTO toolProductDTO = createToolProductDTO(productCreationDTO);
                ToolProduct newToolProduct = toolProductService.createToolProduct(toolProductDTO);
                createdProducts.add(newToolProduct);
            } else if (Objects.equals(productCreationDTO.getCategory(), "Equipment")) {
                EquipmentProductDTO equipmentProductDTO = createEquipmentProductDTO(productCreationDTO);
                EquipmentProduct newEquipmentProduct = equipmentProductService.createEquipmentProduct(equipmentProductDTO);
                createdProducts.add(newEquipmentProduct);
            }
        }
        return createdProducts;
    }

    @Transactional
    public Object updateProduct(Long productId, ProductCreationDTO productToUpdateDTO) {
        String category = productToUpdateDTO.getCategory();
        List<Long> instanceIdsToBeRemoved = productToUpdateDTO.getInstanceIdsToBeRemoved();

        if(Objects.equals(category, "Sale")) {
            SaleProductDTO saleProductDTO = createSaleProductDTO(productToUpdateDTO);
            saleProductService.updateSaleProduct(productId, saleProductDTO);
            if(productToUpdateDTO.getSaleProductInstances() != null && !productToUpdateDTO.getSaleProductInstances().isEmpty()) {
                for(SaleProductInstanceDTO saleProductInstanceDTO : productToUpdateDTO.getSaleProductInstances()) {
                    Long instanceId = saleProductInstanceDTO.getId();
                    if(instanceId == null) {
                        saleProductInstanceService.createInstance(saleProductInstanceDTO);
                    } else {
                        saleProductInstanceService.updateInstance(instanceId, saleProductInstanceDTO);
                    }
                }
            }
            if (instanceIdsToBeRemoved != null && !instanceIdsToBeRemoved.isEmpty()) {
                for(Long instanceId : instanceIdsToBeRemoved){
                    saleProductInstanceService.deleteInstance(instanceId);
                }
            }
            return saleProductService.getSaleProductById(productId);
        } else if (Objects.equals(category, "Tool")) {
            ToolProductDTO toolProductDTO = createToolProductDTO(productToUpdateDTO);
            toolProductService.updateToolProduct(productId, toolProductDTO);
            if(productToUpdateDTO.getToolProductInstances() != null && !productToUpdateDTO.getToolProductInstances().isEmpty()) {
                for(ToolProductInstanceDTO toolProductInstanceDTO : productToUpdateDTO.getToolProductInstances()) {
                    Long instanceId = toolProductInstanceDTO.getId();
                    if(instanceId == null) {
                        toolProductInstanceService.createInstance(toolProductInstanceDTO);
                    } else {
                        toolProductInstanceService.updateInstance(instanceId, toolProductInstanceDTO);
                    }
                }
            }
            if (instanceIdsToBeRemoved != null && !instanceIdsToBeRemoved.isEmpty()) {
                for(Long instanceId : instanceIdsToBeRemoved){
                    toolProductInstanceService.deleteInstance(instanceId);
                }

            }
            return toolProductService.getToolProductById(productId);
        } else if (Objects.equals(category, "Equipment")) {
            EquipmentProductDTO equipmentProductDTO = createEquipmentProductDTO(productToUpdateDTO);
            equipmentProductService.updateEquipmentProduct(productId, equipmentProductDTO);
            if(productToUpdateDTO.getEquipmentProductInstances() !=null && !productToUpdateDTO.getEquipmentProductInstances().isEmpty()) {
                for(EquipmentProductInstanceDTO equipmentProductInstanceDTO : productToUpdateDTO.getEquipmentProductInstances()) {
                    Long instanceId = equipmentProductInstanceDTO.getId();
                    if(instanceId == null) {
                        equipmentProductInstanceService.createInstance(equipmentProductInstanceDTO);
                    } else {
                        equipmentProductInstanceService.updateInstance(instanceId, equipmentProductInstanceDTO);
                    }
                }
            }
            if (instanceIdsToBeRemoved != null && !instanceIdsToBeRemoved.isEmpty()) {
                for(Long instanceId : instanceIdsToBeRemoved){
                    equipmentProductInstanceService.deleteInstance(instanceId);
                }

            }
            return equipmentProductService.getEquipmentProductById(productId);
        }
        throw new IllegalArgumentException("Invalid category: " + category);
    }

    public List<Object> getFilteredProductsWithActiveInstances(ProductFilterDTO filter){

        List<Object> filteredProductsByType = filterProductsByProductType(filter.getProductTypes());

        if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
            filteredProductsByType = searchProductsByKeyword(filteredProductsByType, filter.getKeyword());
        }

        if(filter.getSelectedIds() == null || filter.getSelectedIds().isEmpty()) {
            return combineAllProductsIntoDTOList(filteredProductsByType);
        } else {
            return combineAllProductsIntoDTOList(
                    filterProductsByBrands(filteredProductsByType, filter.getSelectedIds())
            );
        }
    }

    public List<Object> combineAllProductsIntoDTOList(List<Object> productList) {
        List<Object> productsDTOList = new ArrayList<>();
        for(Object product : productList) {
            if(product instanceof SaleProduct) {
                SaleProductDTO saleProductDTO = new SaleProductDTO();
                productsDTOList.add(saleProductService.saleProductToSaleProductDTOConversion((SaleProduct) product, saleProductDTO));
            } else if (product instanceof ToolProduct) {
                ToolProductDTO toolProductDTO = new ToolProductDTO();
                productsDTOList.add(toolProductService.toolProductToToolProductDTOConversion((ToolProduct) product, toolProductDTO));
            } else if (product instanceof EquipmentProduct) {
                EquipmentProductDTO equipmentProductDTO = new EquipmentProductDTO();
                productsDTOList.add(equipmentProductService.equipmentProductToEquipmentProductDTOConversion((EquipmentProduct) product, equipmentProductDTO));
            }
        }
        return productsDTOList;
    }

    @Transactional
    public void deleteProductById(Long productId){
        try {
            if (saleProductService.getSaleProductById(productId) != null) {
                saleProductService.deleteSaleProduct(productId);
                return;
            }
        } catch (ProductNotFoundException ignored) {}

        try {
            if (toolProductService.getToolProductById(productId) != null) {
                toolProductService.deleteToolProduct(productId);
                return;
            }
        } catch (ProductNotFoundException ignored) {}

        try {
            if (equipmentProductService.getEquipmentProductById(productId) != null) {
                equipmentProductService.deleteEquipmentProduct(productId);
            }
        } catch (ProductNotFoundException ignored) {}
    }

    //returns a list of products present in DB, nonExisting are discarded, use case - validate products when finalizing Order
    public List<Object> searchProductsByProductName(List<Object> productList, List<String> productNamesList) {
        List<Object> matchingProducts = new ArrayList<>();
        for(String productName : productNamesList) {
            matchingProducts.addAll(saleProductService.searchSaleProducts(productName));
            matchingProducts.addAll(toolProductService.searchToolProducts(productName));
            matchingProducts.addAll(equipmentProductService.searchEquipmentProducts(productName));
        }
        return productList.stream().filter(product -> matchingProducts.contains(product)).toList();
    }

    public List<Object> searchProductsByKeyword(List<Object> productList, String keyword){
        List<Object> matchingProducts = new ArrayList<>();
        matchingProducts.addAll(saleProductService.searchSaleProducts(keyword));
        matchingProducts.addAll(toolProductService.searchToolProducts(keyword));
        matchingProducts.addAll(equipmentProductService.searchEquipmentProducts(keyword));

        return productList.stream().filter(product -> matchingProducts.contains(product)).toList();
    }

    private SaleProductDTO createSaleProductDTO(ProductCreationDTO productCreationDTO) {
        SaleProductDTO saleProductDTO = new SaleProductDTO();
        saleProductDTO.setProductName(productCreationDTO.getName());
        saleProductDTO.setBrandName(productCreationDTO.getBrandName());
        saleProductDTO.setEstimatedShelfLife(productCreationDTO.getEstimatedShelfLife());
        saleProductDTO.setSellingPrice(productCreationDTO.getEstimatedSellingPrice());
        saleProductDTO.setDescription(productCreationDTO.getDescription());
        saleProductDTO.setIsDeleted(productCreationDTO.getIsDeleted());
        saleProductDTO.setProductInstances(productCreationDTO.getSaleProductInstances());
        return  saleProductDTO;
    }

    private ToolProductDTO createToolProductDTO(ProductCreationDTO productCreationDTO){
        ToolProductDTO toolProductDTO = new ToolProductDTO();
        toolProductDTO.setProductName(productCreationDTO.getName());
        toolProductDTO.setBrandName(productCreationDTO.getBrandName());
        toolProductDTO.setDescription(productCreationDTO.getDescription());
        toolProductDTO.setIsDeleted(productCreationDTO.getIsDeleted());
        toolProductDTO.setProductInstances(productCreationDTO.getToolProductInstances());
        return toolProductDTO;
    }

    private EquipmentProductDTO createEquipmentProductDTO(ProductCreationDTO productCreationDTO) {
        EquipmentProductDTO equipmentProductDTO = new EquipmentProductDTO();
        equipmentProductDTO.setProductName(productCreationDTO.getName());
        equipmentProductDTO.setBrandName(productCreationDTO.getBrandName());
        equipmentProductDTO.setWarrantyLength(productCreationDTO.getEstimatedShelfLife());
        equipmentProductDTO.setDescription(productCreationDTO.getDescription());
        equipmentProductDTO.setIsDeleted(productCreationDTO.getIsDeleted());
        equipmentProductDTO.setProductInstances(productCreationDTO.getEquipmentProductInstances());
        return  equipmentProductDTO;
    }

    private List<Object> filterAllProductByProductType(List<String> productTypes) {
        List<Object> filteredProducts = new ArrayList<>();

        if(productTypes.contains("Sale")) {
            filteredProducts.addAll(saleProductService.getSaleProducts());
        }
        if (productTypes.contains("Tool")){
            filteredProducts.addAll(toolProductService.getToolProducts());
        }
        if(productTypes.contains("Equipment")) {
            filteredProducts.addAll(equipmentProductService.getEquipmentProducts());
        }
        return filteredProducts;
    }

    private List<Object> filterProductsByProductType(List<String> productTypes) {

        List<Object> filteredProducts = new ArrayList<>();

        if(productTypes.contains("Sale")) {
            filteredProducts.addAll(saleProductService.getActiveSaleProductsWithActiveInstances());
        }
        if (productTypes.contains("Tool")){
            filteredProducts.addAll(toolProductService.getActiveToolProductsWithActiveInstances());
        }
        if(productTypes.contains("Equipment")) {
            filteredProducts.addAll(equipmentProductService.getActiveEquipmentProductsWithActiveInstances());
        }
        return filteredProducts;
    }

    private List<Object> filterProductsByBrands(List<Object> productList, List<Long> selectedBrandIds) {

        return productList.stream()
                .filter(product -> selectedBrandIds.contains(getBrandId(product)))
                .toList();
    }

    private <T> Long getBrandId(T product) {
        if (product instanceof SaleProduct) {
            return (((SaleProduct) product).getBrand().getId());
        } else if (product instanceof ToolProduct) {
            return (((ToolProduct) product).getBrand().getId());
        } else if (product instanceof EquipmentProduct) {
            return (((EquipmentProduct) product).getBrand().getId());
        }
        return null;
    }
}
