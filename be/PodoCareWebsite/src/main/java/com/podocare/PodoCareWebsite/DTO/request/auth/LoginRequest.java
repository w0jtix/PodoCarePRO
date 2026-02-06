package com.podocare.PodoCareWebsite.DTO.request.auth;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
