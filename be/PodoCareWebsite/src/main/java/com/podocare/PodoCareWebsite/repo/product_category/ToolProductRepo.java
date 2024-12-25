package com.podocare.PodoCareWebsite.repo.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.product.product_category.ToolProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ToolProductRepo extends JpaRepository<ToolProduct, Long> {

    @Query("SELECT p FROM ToolProduct p WHERE " +
            "LOWER(TRIM(p.productName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%')) OR " +
            "LOWER(TRIM(p.brand.brandName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%'))")
    List<ToolProduct> searchProducts(String keyword);

    @Query ("SELECT DISTINCT sp FROM ToolProduct sp JOIN FETCH sp.productInstances pi WHERE sp.isDeleted = false AND pi.isDeleted = false AND pi.outOfUse = false")
    List<ToolProduct> findAllActiveWithActiveInstances();

    @Query("SELECT p FROM ToolProduct p WHERE LOWER(TRIM(p.productName)) = LOWER(TRIM(:productName))")
    Optional<ToolProduct> findByToolProductName(String productName);

    @Query("SELECT p FROM ToolProduct p WHERE LOWER(TRIM(p.brand.brandName)) = LOWER(TRIM(:brandName))")
    List<ToolProduct> findByBrandName(String brandName);

    @Query("SELECT DISTINCT p.brand FROM ToolProduct p")
    List<Brand> findAllBrands();

    long countByBrand(Brand brand);

}
