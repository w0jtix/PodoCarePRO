package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.VatRate;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "internal_order")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    @ToString.Exclude
    private Supplier supplier;

    @Column(nullable = false, unique = true)
    private Long orderNumber;

    @Column(nullable = false)
    private LocalDate orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    /*@JsonManagedReference*/
    @ToString.Exclude
    @Builder.Default
    private List<OrderProduct> orderProducts = new ArrayList<>();

    /**
     * Gross shipping cost (VAT-inclusive).
     * Total shipping price including VAT.
     * Always uses 23% VAT rate.
     */
    @Column(nullable = false)
    @Builder.Default
    private Double shippingCost = 0.0;
    @Column(nullable = false)
    @Builder.Default
    private Double totalNet = 0.0;
    @Column(nullable = false)
    @Builder.Default
    private Double totalVat = 0.0;
    @Column(nullable = false)
    @Builder.Default
    private Double totalValue = 0.0;

    public void addOrderProduct(OrderProduct orderProduct) {
        orderProducts.add(orderProduct);
        orderProduct.setOrder(this);
    }

    public void removeOrderProduct(OrderProduct orderProduct) {
        orderProducts.remove(orderProduct);
        orderProduct.setOrder(null);
    }

    public void calculateTotals() {
        double productsGrossTotal = orderProducts.stream()
                .mapToDouble(op -> op.getPrice() * op.getQuantity())
                .sum();

        double productsVat = orderProducts.stream()
                .mapToDouble(op -> {
                    double productGrossTotal = op.getPrice() * op.getQuantity();
                    double vatRatePercent = getVatRateValue(op.getVatRate());

                    return productGrossTotal * (vatRatePercent / (100.0 + vatRatePercent));
                })
                .sum();

        double productsNet = productsGrossTotal - productsVat;

        double shippingGross = (shippingCost != null) ? shippingCost : 0.0;
        double shippingVat = 0.0;
        double shippingNet = shippingGross;

        if (shippingGross > 0) {
            // Shipping cost always uses 23% VAT rate
            double shippingVatRatePercent = VatRate.VAT_23.getRate();
            shippingVat = shippingGross * (shippingVatRatePercent / (100.0 + shippingVatRatePercent));
            shippingNet = shippingGross - shippingVat;
        }

        this.totalNet = roundPrice(productsNet + shippingNet);
        this.totalVat = roundPrice(productsVat + shippingVat);
        this.totalValue = roundPrice(productsGrossTotal + shippingGross);
    }

    private double getVatRateValue(VatRate vatRate) {
        if (vatRate == null || !vatRate.isNumeric()) {
            return 0.0;
        }
        return vatRate.getRate();
    }

    private double roundPrice(Double price) {
        return BigDecimal
                .valueOf(price)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
