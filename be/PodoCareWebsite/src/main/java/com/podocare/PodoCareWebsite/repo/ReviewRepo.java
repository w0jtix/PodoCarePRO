package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Review;
import com.podocare.PodoCareWebsite.model.constants.ReviewSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepo extends JpaRepository<Review, Long> {

    Optional<Review> findOneById(Long id);

    List<Review> findAllByClientId(Long id);

    Optional<Review> findFirstByClientIdAndSource(Long clientId, ReviewSource source);

    Optional<Review> findFirstByClientIdAndSourceAndIsUsedFalse(Long clientId, ReviewSource source);

    @Query("""
    SELECT r
    FROM Review r
    WHERE (:isUsed IS NULL OR r.isUsed = :isUsed)
       AND (COALESCE(:keyword, '') = ''
           OR LOWER(r.client.firstName) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(r.client.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))
    AND (:source IS NULL OR r.source = :source)
    """)
    List<Review> findAllWithFilters(
            @Param("keyword") String keyword,
            @Param("source") ReviewSource source,
            @Param("isUsed") Boolean isUsed

            );

    boolean existsByClientId(Long clientId);
}
