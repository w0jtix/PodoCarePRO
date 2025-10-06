package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.EmployeeDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.repo.EmployeeRepo;
import com.podocare.PodoCareWebsite.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepo employeeRepo;

    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepo.findAll().stream()
                .map(EmployeeDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDTO getEmployeeById(Long id) {
        return new EmployeeDTO(employeeRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with given id: " + id)));
    }

    @Override
    public EmployeeDTO createEmployee(EmployeeDTO employee) {
        try{
            if(isNull(employee)){
                return null;
            }
            Employee savedEmployee = employeeRepo.save(employee.toEntity());
            return new EmployeeDTO(savedEmployee);
        } catch (Exception e) {
            throw new CreationException("Failed to create Employee. Reason: " + e.getMessage(), e);
        }

    }

    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employee) {
        try{
            getEmployeeById(id);

            employee.setId(id);
            return new EmployeeDTO(employeeRepo.save(employee.toEntity()));
        } catch(Exception e) {
            throw new UpdateException("Failed to update Employee, Reason: " + e.getMessage(), e);
        }
    }
}
