package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.CompanyExpense;
import com.podocare.PodoCareWebsite.model.constants.ExpenseCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyExpenseRepo extends JpaRepository<CompanyExpense, Long> {

    @EntityGraph(attributePaths = {"expenseItems"})
    @Query("SELECT ce FROM CompanyExpense ce WHERE ce.id = :id")
    Optional<CompanyExpense> findOneByIdWithItems(@Param("id") Long id);

    @Query(
            value = """
    SELECT DISTINCT ce FROM CompanyExpense ce
    WHERE (:categories IS NULL OR ce.category IN :categories)
    AND (ce.expenseDate >= :dateFrom)
    AND (ce.expenseDate <= :dateTo)
    """,
            countQuery = """
    SELECT COUNT(DISTINCT ce.id) FROM CompanyExpense ce
    WHERE (:categories IS NULL OR ce.category IN :categories)
    AND (ce.expenseDate >= :dateFrom)
    AND (ce.expenseDate <= :dateTo)
    """
    )
    Page<CompanyExpense> findAllWithFilters(
            @Param("categories") List<ExpenseCategory> categories,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"expenseItems"})
    Optional<CompanyExpense> findFirstByCategoryOrderByExpenseDateDesc(ExpenseCategory category);
}
