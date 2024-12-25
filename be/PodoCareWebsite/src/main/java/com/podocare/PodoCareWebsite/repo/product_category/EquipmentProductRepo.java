package com.podocare.PodoCareWebsite.repo.product_category;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentProductRepo extends JpaRepository<EquipmentProduct, Long> {

    @Query("SELECT p FROM EquipmentProduct p WHERE " +
            "LOWER(TRIM(p.productName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%')) OR " +
            "LOWER(TRIM(p.brand.brandName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%'))")
    List<EquipmentProduct> searchProducts(String keyword);

    @Query ("SELECT DISTINCT sp FROM EquipmentProduct sp JOIN FETCH sp.productInstances pi WHERE sp.isDeleted = false AND pi.isDeleted = false AND pi.outOfUse = false")
    List<EquipmentProduct> findAllActiveWithActiveInstances();

    @Query("SELECT p FROM EquipmentProduct p WHERE LOWER(TRIM(p.productName)) = LOWER(TRIM(:productName))")
    Optional<EquipmentProduct> findByEquipmentProductName(String productName);

    @Query("SELECT p FROM EquipmentProduct p WHERE LOWER(TRIM(p.brand.brandName)) = LOWER(TRIM(:brandName))")
    List<EquipmentProduct> findByBrandName(String brandName);

    @Query("SELECT DISTINCT p.brand FROM EquipmentProduct p")
    List<Brand> findAllBrands();

    long countByBrand(Brand brand);
}
