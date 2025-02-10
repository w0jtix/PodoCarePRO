package com.podocare.PodoCareWebsite.model.order;

import com.podocare.PodoCareWebsite.model.Brand_Supplier.Supplier;
import com.podocare.PodoCareWebsite.model.VatRate;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.EquipmentProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.SaleProductInstance;
import com.podocare.PodoCareWebsite.model.product.product_category.product_instances.ToolProductInstance;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "internal_order")
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
    private List<OrderProduct> orderProducts = new ArrayList<>();

    private VatRate shippingVatRate;
    private Double shippingCost = 0.0;
    private Double totalNet = 0.0;
    private Double totalVat = 0.0;
    private Double totalValue = 0.0;


    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<SaleProductInstance> saleProductInstances = new ArrayList<>();
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<ToolProductInstance> toolProductInstances = new ArrayList<>();
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<EquipmentProductInstance> equipmentProductInstances = new ArrayList<>();
}
