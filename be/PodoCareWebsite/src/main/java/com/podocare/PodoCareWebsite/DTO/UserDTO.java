package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.User;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String avatar;
    private List<RoleDTO> roles = new ArrayList<>();
    private EmployeeDTO employee;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.avatar = user.getAvatar();
        if(nonNull(user.getRoles()))
            this.roles = user.getRoles().stream()
                    .map(RoleDTO::new)
                    .collect(Collectors.toList());
        if(nonNull(user.getEmployee()))
            this.employee = new EmployeeDTO(user.getEmployee());
    }

    public User toEntity() {
        return User.builder()
                .id(this.id)
                .username(this.username)
                .avatar(this.avatar)
                .roles(this.roles.stream().map(RoleDTO::toEntity).collect(Collectors.toSet()))
                .employee(this.employee != null ? this.employee.toEntity() : null)
                .build();
    }
}