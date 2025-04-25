package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "internal_order")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;


    private Long orderNumber;
    private Date orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @JsonManagedReference
    @ToString.Exclude
    private List<OrderProduct> orderProducts = new ArrayList<>();

    private VatRate shippingVatRate;
    private Double shippingCost = 0.0;
    private Double totalNet = 0.0;
    private Double totalVat = 0.0;
    private Double totalValue = 0.0;
}
