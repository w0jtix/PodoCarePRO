package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.UserDTO;
import com.podocare.PodoCareWebsite.config.security.services.UserDetailsImpl;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import com.podocare.PodoCareWebsite.service.UserService;
import com.podocare.PodoCareWebsite.utils.SessionUtils;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.Objects.isNull;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> userDTOList = userService.getAllUsers();
        return new ResponseEntity<>(userDTOList, userDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable(value = "id") Long id) {
        UserDTO user = userService.getUserById(id);
        return  new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDTO> getUserByEmployeeId(@PathVariable(value = "employeeId") Long employeeId) {
        UserDTO user = userService.getUserByEmployeeId(employeeId);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable(value = "id") Long id, @NonNull @RequestBody UserDTO user) {
        UserDetailsImpl loggedUser = SessionUtils.getUserDetailsFromSession();

        if (isNull(loggedUser) || (!id.equals(loggedUser.getId()) && !SessionUtils.hasUserRole(RoleType.ROLE_ADMIN))) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        UserDTO saved = userService.updateUser(id, user);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }
}
