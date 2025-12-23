package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.EmployeeDTO;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.service.EmployeeService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employee")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/all")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        List<EmployeeDTO> employeeList = employeeService.getAllEmployees();
        return new ResponseEntity<>(employeeList, employeeList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<EmployeeDTO> getEmployeeById(@PathVariable(value="id") Long id) {
        EmployeeDTO employee = employeeService.getEmployeeById(id);
        return new ResponseEntity<>(employee, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<EmployeeDTO> createEmployee(@NonNull @RequestBody EmployeeDTO employee) {
        EmployeeDTO createdEmployee = employeeService.createEmployee(employee);
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('ADMIN')"))
    public ResponseEntity<EmployeeDTO> updateEmployee(@PathVariable(value="id") Long id, EmployeeDTO employee) {
        EmployeeDTO saved = employeeService.updateEmployee(id, employee);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }
}
