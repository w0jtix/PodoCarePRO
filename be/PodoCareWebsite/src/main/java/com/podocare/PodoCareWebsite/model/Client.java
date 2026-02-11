package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "client")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = true)
    private String phoneNumber;

    @Column (nullable = false)
    @Builder.Default
    private Boolean signedRegulations = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean boostClient = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean redFlag = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discount_id")
    private Discount discount;

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
