package com.podocare.PodoCareWebsite.repo.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Repository
public interface SaleProductInstanceRepo extends JpaRepository<SaleProductInstance, Long> {

    List<SaleProductInstance> findBySaleProductId(Long saleProductId);

    @Query("SELECT pi FROM SaleProductInstance pi WHERE pi.saleProduct.id = :saleProductId AND pi.isSold = false AND pi.isUsed = false AND pi.isDeleted = false")
    List<SaleProductInstance> findActiveInstancesByProductId(@Param("saleProductId") Long saleProductId);

    @Query("SELECT COUNT(spi) FROM SaleProductInstance spi WHERE spi.isSold = false AND spi.isUsed = false AND spi.isDeleted = false")
    long countAvailableInstances();

    @Modifying
    @Transactional
    @Query("UPDATE SaleProductInstance e SET e.isDeleted = true WHERE e.id IN :ids")
    void markInstancesAsDeletedByIds(@Param("ids") List<Long> ids);

    long countBySupplier(Supplier supplier);

    Long countBySaleProductIdAndIsSoldFalse(Long saleProductId);
}
