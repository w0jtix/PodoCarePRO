package com.podocare.PodoCareWebsite.DTO.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank
    @Size(min = 6, max = 40)
    private String oldPassword;

    @NotBlank
    @Size(min = 6, max = 40)
    private String newPassword;

}
