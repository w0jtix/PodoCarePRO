package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.RoleDTO;
import com.podocare.PodoCareWebsite.DTO.UserDTO;
import com.podocare.PodoCareWebsite.repo.RoleRepo;
import com.podocare.PodoCareWebsite.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepo roleRepo;

    @Override
    public List<RoleDTO> getAllRoles() {
        return roleRepo.findAll().stream()
                .map(RoleDTO::new)
                .collect(Collectors.toList());
    }
}
