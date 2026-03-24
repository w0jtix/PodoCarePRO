package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "visit_item")
public class VisitItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private BaseService service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_variant_id")
    BaseServiceVariant serviceVariant;

    @Column(nullable = false)
    private String name; // Snapshot: baseService.name lub baseService.name + " " + variant.name

    @Column(nullable = false)
    private int duration; // Snapshot: z baseService lub serviceVariant (priorytet variant)

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Double finalPrice; // jesli custom to z góry przypisane

    @Column(nullable = false)
    private Boolean boostItem;

    @PrePersist
    @PreUpdate
    private void validateItemType() {
        if(service == null && serviceVariant == null) {
            throw new IllegalStateException("Missing reference. Assign either Service or AddOn.");
        }
    }
}
