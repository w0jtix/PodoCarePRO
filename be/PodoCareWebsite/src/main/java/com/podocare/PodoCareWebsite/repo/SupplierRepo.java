package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupplierRepo extends JpaRepository<Supplier, Long> {



    @Query("SELECT s FROM Supplier s WHERE LOWER(TRIM(s.supplierName)) = LOWER(TRIM(:supplierName))")
    Optional<Supplier> findBySupplierName(String supplierName);

}
