package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.request.auth.ChangePasswordRequest;
import com.podocare.PodoCareWebsite.DTO.request.auth.ForceChangePasswordRequest;
import com.podocare.PodoCareWebsite.DTO.request.auth.LoginRequest;
import com.podocare.PodoCareWebsite.DTO.request.auth.SignupRequest;
import com.podocare.PodoCareWebsite.DTO.response.JwtResponse;
import com.podocare.PodoCareWebsite.DTO.response.MessageResponse;
import com.podocare.PodoCareWebsite.config.security.jwt.JwtUtils;
import com.podocare.PodoCareWebsite.config.security.services.UserDetailsImpl;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.model.Role;
import com.podocare.PodoCareWebsite.model.User;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import com.podocare.PodoCareWebsite.repo.RoleRepo;
import com.podocare.PodoCareWebsite.repo.UserRepo;
import com.podocare.PodoCareWebsite.utils.SessionUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepo userRepo;
    private final RoleRepo roleRepo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return new ResponseEntity<>(JwtResponse.builder()
                    .token(jwt)
                    .type(JwtUtils.JWT_TYPE)
                    .id(userDetails.getId())
                    .username(userDetails.getUsername())
                    .avatar(userDetails.getAvatar())
                    .roles(roles)
                    .build(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/createUser")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> createUser(@Valid @RequestBody SignupRequest signupRequest) {
        if(userRepo.existsByUsername(signupRequest.getUsername())) {
            throw new CreationException("Username already exists: " + signupRequest.getUsername());
        }

        Set<Role> roles = new HashSet<>();

        if(signupRequest.getRole() == null || signupRequest.getRole().isEmpty()) {
            Role userRole = roleRepo.findByName(RoleType.ROLE_USER)
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found."));
            roles.add(userRole);
        } else {
            roles = signupRequest.getRole().stream()
                    .map(role ->
                            roleRepo.findByName(role)
                                    .orElseThrow(() -> new ResourceNotFoundException("Role not found.")))
                    .collect(Collectors.toSet());
        }
        userRepo.save(User.builder()
                .username(signupRequest.getUsername())
                .password(encoder.encode((signupRequest.getPassword())))
                .roles(roles)
                .build());

        return new ResponseEntity<>(new MessageResponse("User registered successfully!"), HttpStatus.OK);
    }

    @PostMapping("/changePassword")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        User loggedUser = userRepo.findOneById(SessionUtils.getUserIdFromSession())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with given id: " + SessionUtils.getUserIdFromSession()));
        if(encoder.matches(changePasswordRequest.getOldPassword(), loggedUser.getPassword())) {
            loggedUser.setPassword(encoder.encode(changePasswordRequest.getNewPassword()));
            userRepo.save(loggedUser);
            return new ResponseEntity<>(new MessageResponse("Password changed successfully"), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new MessageResponse("Old password doesn't match"),HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/forceChangePassword")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> forceChangePassword(@Valid @RequestBody ForceChangePasswordRequest forceChangePasswordRequest) {
        User user = userRepo.findOneById(forceChangePasswordRequest.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with given id: " + forceChangePasswordRequest.getUserId()));

        user.setPassword(encoder.encode(forceChangePasswordRequest.getNewPassword()));
        userRepo.save(user);
        return new ResponseEntity<>(new MessageResponse("Password changed successfully"), HttpStatus.OK);
    }
}
