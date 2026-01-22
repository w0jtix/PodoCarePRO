package com.podocare.PodoCareWebsite.model;

import com.podocare.PodoCareWebsite.model.constants.EmploymentType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "employee")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String secondName;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private EmploymentType employmentType = EmploymentType.FULL;

    @Min(0)
    @Max(100)
    @Builder.Default
    private Double bonusPercent = 0.0;

    @Min(0)
    @Max(100)
    @Builder.Default
    private Double saleBonusPercent = 0.0;

    public void softDelete() {
        this.isDeleted = true;
    }

    public void restore() {
        this.isDeleted = false;
    }
}
