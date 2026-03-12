package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.CompanyFinancialSummaryDTO;
import com.podocare.PodoCareWebsite.DTO.CompanyRevenueDTO;
import com.podocare.PodoCareWebsite.DTO.CompanyStatsDTO;
import com.podocare.PodoCareWebsite.DTO.request.EmployeeRevenueFilterDTO;

public interface CompanyStatsService {

    CompanyFinancialSummaryDTO getFinancialSummary(EmployeeRevenueFilterDTO filter);

    CompanyStatsDTO getCompanyStats(EmployeeRevenueFilterDTO filter);

    CompanyRevenueDTO getCompanyRevenueChart(EmployeeRevenueFilterDTO filter);
}
