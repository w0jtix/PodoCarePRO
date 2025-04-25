package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepo extends JpaRepository<Brand, Long> {

    @Query("SELECT b FROM Brand b WHERE "
            + "(COALESCE(:keyword, '') = '' OR LOWER(b.brandName) LIKE LOWER(CONCAT('%', :keyword, '%'))) ")
    List<Brand> findAllWithFilters(
            @Param("keyword") String keyword
    );

    @Query("SELECT b FROM Brand b WHERE LOWER(TRIM(b.brandName)) = LOWER(TRIM(:brandName))")
    Optional<Brand> findByBrandName(String brandName);


}
