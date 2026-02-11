package com.podocare.PodoCareWebsite.DTO.response;

import com.podocare.PodoCareWebsite.DTO.EmployeeDTO;
import com.podocare.PodoCareWebsite.model.Employee;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JwtResponse {
    private String token;
    private String type;
    private Long id;
    private String username;
    private String avatar;
    private List<String> roles;
    private EmployeeDTO employee;
}
