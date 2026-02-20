package com.podocare.PodoCareWebsite.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductReferenceService {

    private final List<ProductReferenceChecker> referenceCheckers;

    public boolean hasAnyReferences(Long productId) {
        return referenceCheckers.stream()
                .anyMatch(checker -> checker.existsByProductId(productId));
    }

    public boolean hasAnyReferencesExcluding(Long productId, Long excludeParentId) {
        return referenceCheckers.stream()
                .anyMatch(checker -> checker.existsByProductIdExcluding(productId, excludeParentId));
    }
}
