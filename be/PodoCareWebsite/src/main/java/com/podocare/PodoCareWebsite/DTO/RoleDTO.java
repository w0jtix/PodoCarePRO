package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Role;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import static java.util.Objects.isNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private Long id;
    private RoleType name;

    public RoleDTO (Role role) {
        if(isNull(role))
            return;
        this.id = role.getId();
        this.name = role.getName();
    }

    public Role toEntity() {
        return Role.builder()
                .id(this.id)
                .name(this.name)
                .build();
    }
}
