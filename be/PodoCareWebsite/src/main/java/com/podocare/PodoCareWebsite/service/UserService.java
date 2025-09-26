package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.UserDTO;
import com.podocare.PodoCareWebsite.DTO.request.auth.SignupRequest;

import java.util.List;
import java.util.Optional;

public interface UserService {

    List<UserDTO> getAllUsers();

    UserDTO getUserById(Long id);

    UserDTO updateUser(Long id, UserDTO user);
}
