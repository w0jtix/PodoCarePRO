package com.podocare.PodoCareWebsite.DTO.request.auth;

import com.podocare.PodoCareWebsite.DTO.EmployeeDTO;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private Set<RoleType> role;
}
