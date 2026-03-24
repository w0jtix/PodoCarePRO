package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_report")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InventoryReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Employee createdBy;

    @Column(nullable = false)
    private LocalDate createdAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean approved = false;

    @OneToMany(mappedBy = "inventoryReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<InventoryReportItem> items = new ArrayList<>();

    public void addItem(InventoryReportItem item) {
        items.add(item);
        item.setInventoryReport(this);
    }

    public void removeItem(InventoryReportItem item) {
        items.remove(item);
        item.setInventoryReport(null);
    }
}
