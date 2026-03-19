package com.podocare.PodoCareWebsite.service;

public interface ProductReferenceChecker {

    boolean existsByProductId(Long productId);

    default boolean existsByProductIdExcluding(Long productId, Long excludeParentId) {
        return existsByProductId(productId);
    }
}
