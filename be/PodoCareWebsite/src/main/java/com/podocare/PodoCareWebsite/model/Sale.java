package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "sale")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sale_id")
    private List<SaleItem> items = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Double totalNet = 0.0;
    @Column(nullable = false)
    @Builder.Default
    private Double totalVat = 0.0;
    @Column(nullable = false)
    @Builder.Default
    private Double totalValue = 0.0;
}
