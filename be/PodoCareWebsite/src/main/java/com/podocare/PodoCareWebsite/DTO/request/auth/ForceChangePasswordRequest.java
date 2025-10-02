package com.podocare.PodoCareWebsite.DTO.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ForceChangePasswordRequest {

    @NotNull
    private Long userId;

    @NotBlank
    @Size(min = 6, max = 40)
    private String newPassword;
}
