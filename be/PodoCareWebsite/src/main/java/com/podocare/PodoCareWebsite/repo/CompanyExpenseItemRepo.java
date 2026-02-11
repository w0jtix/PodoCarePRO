package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.CompanyExpenseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyExpenseItemRepo extends JpaRepository<CompanyExpenseItem, Long> {
}
