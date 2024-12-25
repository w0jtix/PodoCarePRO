package com.podocare.PodoCareWebsite.service.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ProductFilterDTO;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class AllProductsService {
    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    private EquipmentProductService equipmentProductService;

    public List<Object> getFilteredProductsWithActiveInstances(ProductFilterDTO filter){

        List<Object> filteredProductsByType = filterProductsByProductType(filter.getProductTypes());

        if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
            filteredProductsByType = searchProducts(filteredProductsByType, filter.getKeyword());
        }

        if(filter.getSelectedBrandIds() == null || filter.getSelectedBrandIds().isEmpty()) {
            return filteredProductsByType;
        } else {
            return filterProductsByBrands(filteredProductsByType, filter.getSelectedBrandIds());
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

    public List<Object> searchProducts(List<Object> productList, String keyword){
        List<Object> matchingProducts = new ArrayList<>();
        matchingProducts.addAll(saleProductService.searchSaleProducts(keyword));
        matchingProducts.addAll(toolProductService.searchToolProducts(keyword));
        matchingProducts.addAll(equipmentProductService.searchEquipmentProducts(keyword));

        return productList.stream().filter(product -> matchingProducts.contains(product)).toList();
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
