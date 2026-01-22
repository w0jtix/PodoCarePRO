package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.EmployeeRevenueDTO;
import com.podocare.PodoCareWebsite.DTO.EmployeeStatsDTO;
import com.podocare.PodoCareWebsite.DTO.request.EmployeeRevenueFilterDTO;

import java.util.List;

public interface StatisticsService {

    EmployeeRevenueDTO getEmployeeRevenue(EmployeeRevenueFilterDTO filter);

    List<EmployeeStatsDTO> getEmployeeStats(EmployeeRevenueFilterDTO filter);
}
