package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.DTO.request.EmployeeRevenueFilterDTO;
import com.podocare.PodoCareWebsite.service.CompanyStatsService;
import com.podocare.PodoCareWebsite.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final CompanyStatsService companyStatsService;

    @PostMapping("/employee-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeRevenueDTO> getEmployeeRevenue(
            @RequestBody EmployeeRevenueFilterDTO filter
    ) {
        EmployeeRevenueDTO result = statisticsService.getEmployeeRevenue(filter);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/employee-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeStatsDTO>> getEmployeeStats(
            @RequestBody EmployeeRevenueFilterDTO filter
    ) {
        List<EmployeeStatsDTO> result = statisticsService.getEmployeeStats(filter);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/company-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyFinancialSummaryDTO> getCompanyFinancialSummary(
            @RequestBody EmployeeRevenueFilterDTO filter
    ) {
        CompanyFinancialSummaryDTO result = companyStatsService.getFinancialSummary(filter);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/company-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyStatsDTO> getCompanyStats(
            @RequestBody EmployeeRevenueFilterDTO filter
    ) {
        CompanyStatsDTO result = companyStatsService.getCompanyStats(filter);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PostMapping("/company-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanyRevenueDTO> getCompanyRevenue(
            @RequestBody EmployeeRevenueFilterDTO filter
    ) {
        CompanyRevenueDTO result = companyStatsService.getCompanyRevenueChart(filter);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
