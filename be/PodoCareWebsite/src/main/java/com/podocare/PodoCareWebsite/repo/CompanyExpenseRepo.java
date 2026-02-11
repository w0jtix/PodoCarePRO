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

import com.podocare.PodoCareWebsite.repo.projection.CategoryExpenseProjection;
import com.podocare.PodoCareWebsite.repo.projection.CompanyExpenseProjection;

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

    // ========== Company Stats Aggregation Queries ==========

    @Query("""
        SELECT COALESCE(SUM(ce.totalValue), 0)
        FROM CompanyExpense ce
        WHERE ce.expenseDate BETWEEN :from AND :to
    """)
    Double sumTotalExpenses(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
        SELECT MONTH(ce.expenseDate) AS period,
               COALESCE(SUM(ce.totalValue), 0) AS totalExpense
        FROM CompanyExpense ce
        WHERE YEAR(ce.expenseDate) = :year
        GROUP BY MONTH(ce.expenseDate)
        ORDER BY MONTH(ce.expenseDate)
    """)
    List<CompanyExpenseProjection> findMonthlyExpensesByYear(@Param("year") Integer year);

    @Query("""
        SELECT DAY(ce.expenseDate) AS period,
               COALESCE(SUM(ce.totalValue), 0) AS totalExpense
        FROM CompanyExpense ce
        WHERE YEAR(ce.expenseDate) = :year
          AND MONTH(ce.expenseDate) = :month
        GROUP BY DAY(ce.expenseDate)
        ORDER BY DAY(ce.expenseDate)
    """)
    List<CompanyExpenseProjection> findDailyExpensesByYearAndMonth(
            @Param("year") Integer year,
            @Param("month") Integer month
    );

    @Query("""
        SELECT ce.category AS category,
               COALESCE(SUM(ce.totalValue), 0) AS totalAmount
        FROM CompanyExpense ce
        WHERE ce.expenseDate BETWEEN :from AND :to
        GROUP BY ce.category
        ORDER BY SUM(ce.totalValue) DESC
    """)
    List<CategoryExpenseProjection> findExpensesByCategory(
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
