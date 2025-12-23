package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, Long> {
    Optional<Employee> findOneById(Long id);

    @Query("SELECT e FROM Employee e WHERE e.isDeleted = false")
    List<Employee> findAllActive();
}
