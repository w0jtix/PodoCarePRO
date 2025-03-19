package com.podocare.PodoCareWebsite.repo.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepo extends JpaRepository<Brand, Long> {

    @Query("SELECT b FROM Brand b WHERE LOWER(TRIM(b.brandName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%'))")
    List<Brand> searchBrands(String keyword);

    @Query("SELECT b FROM Brand b WHERE LOWER(TRIM(b.brandName)) = LOWER(TRIM(:brandName))")
    Optional<Brand> findByBrandName(String brandName);

    @Query("SELECT DISTINCT b FROM Brand b " +
            "WHERE (:includeSale = true AND b IN (SELECT sp.brand FROM SaleProduct sp " +
            "JOIN sp.productInstances pi WHERE sp.isDeleted = false AND pi.isSold = false AND pi.isUsed = false)) " +
            "OR (:includeTool = true AND b IN (SELECT tp.brand FROM ToolProduct tp " +
            "JOIN tp.productInstances pi WHERE tp.isDeleted = false AND pi.outOfUse = false)) " +
            "OR (:includeEquipment = true AND b IN (SELECT ep.brand FROM EquipmentProduct ep " +
            "JOIN ep.productInstances pi WHERE ep.isDeleted = false AND pi.outOfUse = false))")
    List<Brand> findDistinctBrandsForActiveProductsWithActiveInstances(
            @Param("includeSale") boolean includeSale,
            @Param("includeTool") boolean includeTool,
            @Param("includeEquipment") boolean includeEquipment
    );

    @Query("SELECT DISTINCT b FROM Brand b " +
            "WHERE ((:includeSale = true AND b IN (SELECT sp.brand FROM SaleProduct sp " +
            "JOIN sp.productInstances pi WHERE sp.isDeleted = false AND pi.isSold = false AND pi.isUsed = false " +
            "AND (LOWER(TRIM(sp.productName)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(TRIM(b.brandName)) LIKE LOWER(CONCAT('%', :keyword, '%'))))) " +
            "OR (:includeTool = true AND b IN (SELECT tp.brand FROM ToolProduct tp " +
            "JOIN tp.productInstances pi WHERE tp.isDeleted = false AND pi.outOfUse = false " +
            "AND (LOWER(TRIM(tp.productName)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(TRIM(b.brandName)) LIKE LOWER(CONCAT('%', :keyword, '%'))))) " +
            "OR (:includeEquipment = true AND b IN (SELECT ep.brand FROM EquipmentProduct ep " +
            "JOIN ep.productInstances pi WHERE ep.isDeleted = false AND pi.outOfUse = false " +
            "AND (LOWER(TRIM(ep.productName)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(TRIM(b.brandName)) LIKE LOWER(CONCAT('%', :keyword, '%'))))))")
    List<Brand> findDistinctBrandsFilteredByTypeAndKeyword(
            @Param("includeSale") boolean includeSale,
            @Param("includeTool") boolean includeTool,
            @Param("includeEquipment") boolean includeEquipment,
            @Param("keyword") String keyword
    );
}
