package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.UserDTO;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.model.User;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import com.podocare.PodoCareWebsite.repo.EmployeeRepo;
import com.podocare.PodoCareWebsite.repo.UserRepo;
import com.podocare.PodoCareWebsite.service.UserService;
import com.podocare.PodoCareWebsite.utils.SessionUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final EmployeeRepo employeeRepo;

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepo.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserById(Long id){
        return new UserDTO(userRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with given id: " + id)));
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO user) {
        try {
            User existingUser = userRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with given id: " + id));

            Employee employee = existingUser.getEmployee();
            if(user.getEmployee() != null && user.getEmployee().getId() != null) {
                employee = employeeRepo.findById(user.getEmployee().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Employee not found with given id: " + user.getEmployee().getId()));
            } else if (user.getEmployee() == null) {
                employee = null;
            }
            User entity = user.toEntity();
            entity.setId(id);
            entity.setPassword(existingUser.getPassword());
            entity.setEmployee(employee);
            //disable these if not ROLE_ADMIN
            if (!SessionUtils.hasUserRole(RoleType.ROLE_ADMIN)) {
                entity.setRoles(existingUser.getRoles());
                entity.setUsername(existingUser.getUsername());
                entity.setEmployee(existingUser.getEmployee());
            }

            userRepo.saveAndFlush(entity);
            return new UserDTO(userRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with given id: " + id)));
        } catch (Exception e) {
            throw new UpdateException("Failed to update User, Reason: " + e.getMessage(), e);
        }
    }
}
