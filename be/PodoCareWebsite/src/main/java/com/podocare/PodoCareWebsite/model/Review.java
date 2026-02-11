package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.ReviewSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "review")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewSource source;

    @Column(nullable = false)
    private LocalDate issueDate;
}
