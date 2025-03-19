package com.podocare.PodoCareWebsite.repo.product_category.product_instances;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface EquipmentProductInstanceRepo extends JpaRepository<EquipmentProductInstance, Long> {

    List<EquipmentProductInstance> findByEquipmentProductId(Long equipmentProductId);

    @Query("SELECT pi FROM EquipmentProductInstance pi WHERE pi.equipmentProduct.id = :equipmentProductId AND pi.outOfUse = false")
    List<EquipmentProductInstance> findActiveInstancesByProductId(@Param("equipmentProductId") Long equipmentProductId);

    @Query("SELECT COUNT(spi) FROM EquipmentProductInstance spi WHERE spi.outOfUse = false")
    long countAvailableInstances();

    Long countByEquipmentProductIdAndOutOfUseFalse(Long equipmentProductId);
    Long countByEquipmentProductIdAndOutOfUseTrue(Long equipmentProductId);
}
