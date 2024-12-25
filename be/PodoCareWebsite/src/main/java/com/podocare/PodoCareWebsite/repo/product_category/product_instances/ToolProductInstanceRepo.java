package com.podocare.PodoCareWebsite.repo.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ToolProductInstanceRepo extends JpaRepository<ToolProductInstance, Long> {

    List<ToolProductInstance> findByToolProductId(Long toolProductId);

    @Query("SELECT pi FROM ToolProductInstance pi WHERE pi.toolProduct.id = :toolProductId AND pi.outOfUse = false AND pi.isDeleted = false")
    List<ToolProductInstance> findActiveInstancesByProductId(@Param("toolProductId")Long toolProductId);

    @Query("SELECT COUNT(spi) FROM ToolProductInstance spi WHERE spi.outOfUse = false AND spi.isDeleted = false")
    long countAvailableInstances();

    @Modifying
    @Transactional
    @Query("UPDATE ToolProductInstance e SET e.isDeleted = true WHERE e.id IN :ids")
    void markInstancesAsDeletedByIds(@Param("ids") List<Long> ids);

    long countBySupplier(Supplier supplier);

    Long countByToolProductIdAndOutOfUseFalse(Long toolProductId);
    Long countByToolProductIdAndOutOfUseTrue(Long toolProductId);
}
