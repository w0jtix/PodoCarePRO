package com.podocare.PodoCareWebsite.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "app_settings")
public class AppSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @Builder.Default
    private Integer voucherExpiryTime = 3; //MONTHS

    @Column(nullable = false)
    @Builder.Default
    private Integer visitAbsenceRate = 80; //%

    @Column(nullable = false)
    @Builder.Default
    private Integer visitVipRate = 140; //%

    @Column(nullable = false)
    @Builder.Default
    private Integer boostNetRate = 45; //%

    @Column(nullable = false)
    @Builder.Default
    private Integer googleReviewDiscount = 5; //%

    @Column(nullable = false)
    @Builder.Default
    private Integer booksyHappyHours = 5; //%
}
