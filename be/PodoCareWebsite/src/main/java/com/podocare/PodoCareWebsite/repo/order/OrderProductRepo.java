package com.podocare.PodoCareWebsite.repo.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.order.OrderProduct;
import com.podocare.PodoCareWebsite.model.product.product_category.EquipmentProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderProductRepo extends JpaRepository<OrderProduct, Long> {
    @Query("SELECT COUNT(op) > 0 FROM OrderProduct op WHERE op.saleProduct.id = :saleProductId")
    boolean hasSaleProductReference(@Param("saleProductId") Long saleProductId);

    @Query("SELECT COUNT(op) > 0 FROM OrderProduct op WHERE op.toolProduct.id = :toolProductId")
    boolean hasToolProductReference(@Param("toolProductId") Long toolProductId);

    @Query("SELECT COUNT(op) > 0 FROM OrderProduct op WHERE op.equipmentProduct.id = :equipmentProductId")
    boolean hasEquipmentProductReference(@Param("equipmentProductId") Long equipmentProductId);

}
