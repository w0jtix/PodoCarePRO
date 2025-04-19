package com.podocare.PodoCareWebsite.repo.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepo extends JpaRepository<Supplier, Long> {

    @Query("SELECT p from Supplier p WHERE " +
    "LOWER(TRIM(p.supplierName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%'))")
    List<Supplier> searchSuppliers(String keyword);

    @Query("SELECT b FROM Supplier b WHERE LOWER(TRIM(b.supplierName)) = LOWER(TRIM(:supplierName))")
    Optional<Supplier> findBySupplierName(String supplierName);

}
