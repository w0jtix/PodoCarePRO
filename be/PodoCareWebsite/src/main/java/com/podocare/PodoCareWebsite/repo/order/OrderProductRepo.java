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
    @Query("SELECT COUNT(op) > 0 FROM OrderProduct op WHERE op.saleProductId = :saleProductId")
    boolean hasSaleProductReference(@Param("saleProductId") Long saleProductId);

    @Query("SELECT COUNT(op) > 0 FROM OrderProduct op WHERE op.toolProductId = :toolProductId")
    boolean hasToolProductReference(@Param("toolProductId") Long toolProductId);

    @Query("SELECT COUNT(op) > 0 FROM OrderProduct op WHERE op.equipmentProductId = :equipmentProductId")
    boolean hasEquipmentProductReference(@Param("equipmentProductId") Long equipmentProductId);



    @Query("SELECT COUNT(op) FROM OrderProduct op WHERE op.saleProductId = :saleProductId AND op.order.id = :orderId")
    long countSaleProductInOrder(@Param("saleProductId") Long saleProductId, @Param("orderId") Long orderId);

    @Query("SELECT COUNT(DISTINCT op.order.id) FROM OrderProduct op WHERE op.saleProductId = :saleProductId AND op.order.id <> :orderId")
    long countOrdersWithSaleProductReferenceExceptOrder(@Param("saleProductId") Long saleProductId, @Param("orderId") Long orderId);

    @Query("SELECT COUNT(op) FROM OrderProduct op WHERE op.toolProductId = :toolProductId AND op.order.id = :orderId")
    long countToolProductInOrder(@Param("toolProductId") Long toolProductId, @Param("orderId") Long orderId);

    @Query("SELECT COUNT(DISTINCT op.order.id) FROM OrderProduct op WHERE op.toolProductId = :toolProductId AND op.order.id <> :orderId")
    long countOrdersWithToolProductReferenceExceptOrder(@Param("toolProductId") Long toolProductId, @Param("orderId") Long orderId);

    @Query("SELECT COUNT(op) FROM OrderProduct op WHERE op.equipmentProductId = :equipmentProductId AND op.order.id = :orderId")
    long countEquipmentProductInOrder(@Param("equipmentProductId") Long equipmentProductId, @Param("orderId") Long orderId);

    @Query("SELECT COUNT(DISTINCT op.order.id) FROM OrderProduct op WHERE op.equipmentProductId = :equipmentProductId AND op.order.id <> :orderId")
    long countOrdersWithEquipmentProductReferenceExceptOrder(@Param("equipmentProductId") Long equipmentProductId, @Param("orderId") Long orderId);


}
