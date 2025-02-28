package com.podocare.PodoCareWebsite.service.product_category;

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
                orderProductDTO.setId(saleProduct.getId());
                orderProductValidator.getExistingProducts().add(orderProductDTO);
            } else if (toolProductService.toolProductAlreadyExists(productName)) {
                ToolProduct toolProduct = toolProductService.findByToolProductName(productName);
                orderProductDTO.setId(toolProduct.getId());
                orderProductValidator.getExistingProducts().add(orderProductDTO);
            } else if (equipmentProductService.equipmentProductAlreadyExists(productName)) {
                EquipmentProduct equipmentProduct = equipmentProductService.findByEquipmentProductName(productName);
                orderProductDTO.setId(equipmentProduct.getId());
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




    public List<Object> getFilteredProductsWithActiveInstances(ProductFilterDTO filter){

        List<Object> filteredProductsByType = filterProductsByProductType(filter.getProductTypes());

        if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
            filteredProductsByType = searchProductsByKeyword(filteredProductsByType, filter.getKeyword());
        }

        if(filter.getSelectedIds() == null || filter.getSelectedIds().isEmpty()) {
            return filteredProductsByType;
        } else {
            return filterProductsByBrands(filteredProductsByType, filter.getSelectedIds());
        }
    }

    public void deleteProductById(Long productId){
        if (saleProductService.getSaleProductById(productId) != null) {
            saleProductService.deleteSaleProduct(productId);
        } else if (toolProductService.getToolProductById(productId) != null) {
            toolProductService.deleteToolProduct(productId);
        } else if (equipmentProductService.getEquipmentProductById(productId) != null) {
            equipmentProductService.deleteEquipmentProduct(productId);
        }
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
        saleProductDTO.setEstimatedShelfLife(productCreationDTO.getShelfLife());
        saleProductDTO.setSellingPrice(productCreationDTO.getSellingPrice());
        saleProductDTO.setDescription(productCreationDTO.getDescription());
        saleProductDTO.setProductInstances(productCreationDTO.getSaleProductInstances());
        return  saleProductDTO;
    }

    private ToolProductDTO createToolProductDTO(ProductCreationDTO productCreationDTO){
        ToolProductDTO toolProductDTO = new ToolProductDTO();
        toolProductDTO.setProductName(productCreationDTO.getName());
        toolProductDTO.setBrandName(productCreationDTO.getBrandName());
        toolProductDTO.setDescription(productCreationDTO.getDescription());
        toolProductDTO.setProductInstances(productCreationDTO.getToolProductInstances());
        return toolProductDTO;
    }

    private EquipmentProductDTO createEquipmentProductDTO(ProductCreationDTO productCreationDTO) {
        EquipmentProductDTO equipmentProductDTO = new EquipmentProductDTO();
        equipmentProductDTO.setProductName(productCreationDTO.getName());
        equipmentProductDTO.setBrandName(productCreationDTO.getBrandName());
        equipmentProductDTO.setWarrantyLength(productCreationDTO.getShelfLife());
        equipmentProductDTO.setDescription(productCreationDTO.getDescription());
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
