package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "service")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BaseService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private int duration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_category_id", nullable = false)
    private BaseServiceCategory category;

    @OneToMany(
            mappedBy = "baseService",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private Set<BaseServiceVariant> variants = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    public void softDelete() {
        this.isDeleted = true;
    }

    public void restore() {
        this.isDeleted = false;
    }

}