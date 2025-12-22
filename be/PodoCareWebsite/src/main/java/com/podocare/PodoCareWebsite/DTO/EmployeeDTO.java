package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Employee;
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

    public EmployeeDTO(Employee employee) {
        this.id = employee.getId();
        this.name = employee.getName();
        this.secondName = employee.getSecondName();
        this.isDeleted = employee.getIsDeleted();
    }


    public Employee toEntity() {
        return Employee.builder()
                .id(this.id)
                .name(this.name)
                .secondName(this.secondName)
                .isDeleted(this.isDeleted != null ? this.isDeleted : false)
                .build();
    }
}
