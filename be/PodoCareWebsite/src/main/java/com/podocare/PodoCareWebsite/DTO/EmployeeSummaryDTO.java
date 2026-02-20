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
public class EmployeeSummaryDTO {

    private Long id;
    private String name;
    private String lastName;

    public EmployeeSummaryDTO(Employee employee) {
        this.id = employee.getId();
        this.name = employee.getName();
        this.lastName = employee.getLastName();
    }

    public Employee toEntity() {
        return Employee.builder()
                .id(this.id)
                .name(this.name)
                .lastName(this.lastName)
                .build();
    }
}
