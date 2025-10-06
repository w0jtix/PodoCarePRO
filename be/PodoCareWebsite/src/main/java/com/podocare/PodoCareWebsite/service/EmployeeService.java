package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.EmployeeDTO;

import java.util.List;

public interface EmployeeService {

    List<EmployeeDTO> getAllEmployees();

    EmployeeDTO getEmployeeById(Long id);

    EmployeeDTO createEmployee(EmployeeDTO employee);

    EmployeeDTO updateEmployee(Long id, EmployeeDTO employee);
}
