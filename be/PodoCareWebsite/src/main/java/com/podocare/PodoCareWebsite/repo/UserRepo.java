package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findOneById(Long id);

    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);
}
