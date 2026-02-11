package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.model.constants.EmploymentType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeDTO {

    private Long id;
    private String name;
    private String secondName;
    private Boolean isDeleted;
    private EmploymentType employmentType;
    private Double bonusPercent;
    private Double saleBonusPercent;

    public EmployeeDTO(Employee employee) {
        this.id = employee.getId();
        this.name = employee.getName();
        this.secondName = employee.getSecondName();
        this.isDeleted = employee.getIsDeleted();
        this.employmentType = employee.getEmploymentType();
        this.bonusPercent = employee.getBonusPercent();
        this.saleBonusPercent = employee.getSaleBonusPercent();
    }


    public Employee toEntity() {
        return Employee.builder()
                .id(this.id)
                .name(this.name)
                .secondName(this.secondName)
                .isDeleted(this.isDeleted != null ? this.isDeleted : false)
                .employmentType(this.employmentType != null ? this.employmentType : EmploymentType.HALF)
                .bonusPercent(this.bonusPercent)
                .saleBonusPercent(this.saleBonusPercent)
                .build();
    }
}
