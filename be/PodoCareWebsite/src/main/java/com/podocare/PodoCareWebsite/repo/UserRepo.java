package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findOneById(Long id);

    Optional<User> findByUsername(String username);

    Boolean existsByUsername(String username);

    Optional<User> findByEmployeeId(Long employeeId);

    @Query("SELECT u.avatar FROM User u WHERE u.employee.id = :employeeId")
    String findAvatarByEmployeeId(@Param("employeeId") Long employeeId);

    List<User> findByEmployeeIsNull();
}
