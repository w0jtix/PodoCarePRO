package com.podocare.PodoCareWebsite.repo.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.product.product_category.SaleProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface SaleProductRepo extends JpaRepository<SaleProduct, Long> {

    @Query("SELECT p FROM SaleProduct p WHERE " +
            "LOWER(TRIM(p.productName)) LIKE LOWER(CONCAT(TRIM(:keyword), '%')) OR " +
            "LOWER(TRIM(p.brand.brandName)) LIKE LOWER(CONCAT(TRIM(:keyword), '%'))")
    List<SaleProduct> searchProducts(String keyword);

    @Query("SELECT DISTINCT sp FROM SaleProduct sp LEFT JOIN FETCH sp.productInstances pi WHERE sp.isDeleted = false")
    List<SaleProduct> findAllActiveSaleProducts();

    @Query("SELECT p FROM SaleProduct p WHERE LOWER(TRIM(p.productName)) = LOWER(TRIM(:productName))")
    Optional<SaleProduct> findBySaleProductName(String productName);

    @Query("SELECT p FROM SaleProduct p WHERE LOWER(TRIM(p.brand.brandName)) = LOWER(TRIM(:brandName))")
    List<SaleProduct> findByBrandName(String brandName);

    @Query("SELECT DISTINCT p.brand FROM SaleProduct p")
    List<Brand> findAllBrands();

    long countByBrand(Brand brand);
}
