package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "service_variant")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BaseServiceVariant {
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
    @JoinColumn(name = "base_service_id", nullable = false)
    private BaseService baseService;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    public void softDelete() {
        this.isDeleted = true;
    }

    public void restore() {
        this.isDeleted = false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseServiceVariant)) return false;
        BaseServiceVariant that = (BaseServiceVariant) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
