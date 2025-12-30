package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.VatRate;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "order_product")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    /*@JsonBackReference*/
    @ToString.Exclude
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id", nullable = false)
    private Product product;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name= "quantity", nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "vat_rate", nullable = false)
    private VatRate vatRate;

    /**
     * Gross price (VAT-inclusive) per unit.
     * User enters the full price including VAT on frontend.
     */
    @Column(name = "price", nullable = false)
    private Double price;
}
