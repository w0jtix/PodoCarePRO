package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Role;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepo extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
