package com.podocare.PodoCareWebsite.controller.product_category;

import com.podocare.PodoCareWebsite.model.product.product_category.ProductFilterDTO;
import com.podocare.PodoCareWebsite.service.product_category.AllProductsService;
import com.podocare.PodoCareWebsite.service.product_category.EquipmentProductService;
import com.podocare.PodoCareWebsite.service.product_category.SaleProductService;
import com.podocare.PodoCareWebsite.service.product_category.ToolProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class GeneralProductController {

    @Autowired
    private SaleProductService saleProductService;
    @Autowired
    private ToolProductService toolProductService;
    @Autowired
    private EquipmentProductService equipmentProductService;
    @Autowired
    private AllProductsService allProductsService;

    @PostMapping("/filter")
    public ResponseEntity<List<Object>> getFilteredProductsWithActiveInstances(@RequestBody ProductFilterDTO productFilterDTO) {
        List<Object> allProductsList = allProductsService.getFilteredProductsWithActiveInstances(productFilterDTO);
        return new ResponseEntity<>(allProductsList, allProductsList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) {
        allProductsService.deleteProductById(productId);
        return new ResponseEntity<>("Product successfully deleted.", HttpStatus.OK);
    }

}
