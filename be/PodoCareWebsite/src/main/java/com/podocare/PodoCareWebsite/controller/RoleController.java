package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.RoleDTO;
import com.podocare.PodoCareWebsite.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<RoleDTO>> getAllUsers() {
        List<RoleDTO> roleDTOList = roleService.getAllRoles();
        return new ResponseEntity<>(roleDTOList, HttpStatus.OK);
    }
}
