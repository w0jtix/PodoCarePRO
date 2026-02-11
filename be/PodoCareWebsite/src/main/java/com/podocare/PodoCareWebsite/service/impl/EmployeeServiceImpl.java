package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.EmployeeDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.repo.EmployeeRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
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
    private final AuditLogService auditLogService;

    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepo.findAllActive().stream()
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
            EmployeeDTO savedDTO = new EmployeeDTO(savedEmployee);
            auditLogService.logCreate("Employee", savedDTO.getId(), savedDTO.getName() + savedDTO.getSecondName(), savedDTO);
            return savedDTO;
        } catch (Exception e) {
            throw new CreationException("Failed to create Employee. Reason: " + e.getMessage(), e);
        }

    }

    @Override
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employee) {
        try{
            EmployeeDTO oldEmployeeSnapshot = getEmployeeById(id);

            employee.setId(id);
            EmployeeDTO savedDTO = new EmployeeDTO(employeeRepo.save(employee.toEntity()));
            auditLogService.logUpdate("Employee", id, oldEmployeeSnapshot.getName() + oldEmployeeSnapshot.getSecondName(), oldEmployeeSnapshot, savedDTO);
            return savedDTO;
        } catch(Exception e) {
            throw new UpdateException("Failed to update Employee, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteEmployeeById(Long id) {
        try {
            Employee employee = employeeRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

            if (employee.getIsDeleted()) {
                throw new DeletionException("Employee is already soft-deleted.");
            }

            EmployeeDTO employeeSnapshot = new EmployeeDTO(employee);
            employee.softDelete();
            employeeRepo.save(employee);
            auditLogService.logDelete("Employee", id, employeeSnapshot.getName() + employeeSnapshot.getSecondName(), employeeSnapshot);
        } catch (ResourceNotFoundException | DeletionException e) {
            throw e;
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Employee, Reason: " + e.getMessage(), e);
        }
    }
}
