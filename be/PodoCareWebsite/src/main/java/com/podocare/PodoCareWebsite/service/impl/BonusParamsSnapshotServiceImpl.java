package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.model.AppSettings;
import com.podocare.PodoCareWebsite.model.BonusParamsSnapshot;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.model.StatSettings;
import com.podocare.PodoCareWebsite.repo.AppSettingsRepo;
import com.podocare.PodoCareWebsite.repo.BonusParamsSnapshotRepo;
import com.podocare.PodoCareWebsite.repo.EmployeeRepo;
import com.podocare.PodoCareWebsite.repo.StatSettingsRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.BonusParamsSnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BonusParamsSnapshotServiceImpl implements BonusParamsSnapshotService {

    private final BonusParamsSnapshotRepo bonusParamsSnapshotRepo;
    private final EmployeeRepo employeeRepo;
    private final AppSettingsRepo appSettingsRepo;
    private final StatSettingsRepo statSettingsRepo;
    private final AuditLogService auditLogService;

    @Override
    @Scheduled(cron = "0 59 23 28-31 * ?")
    @Transactional
    public void createMonthlySnapshots() {
        LocalDate today = LocalDate.now();
        if (today.getDayOfMonth() != today.lengthOfMonth()) {
            return;
        }

        int year = today.getYear();
        int month = today.getMonthValue();

        AppSettings appSettings = appSettingsRepo.getSettings();
        StatSettings statSettings = statSettingsRepo.getSettings();

        double boostNetRate = appSettings.getBoostNetRate() != null ? appSettings.getBoostNetRate() : 0.0;
        double bonusThreshold = statSettings.getBonusThreshold();

        List<Employee> activeEmployees = employeeRepo.findAllActive();
        List<BonusParamsSnapshot> toSave = new ArrayList<>();

        for (Employee employee : activeEmployees) {
            Optional<BonusParamsSnapshot> existing = bonusParamsSnapshotRepo
                    .findByEmployeeIdAndYearAndMonth(employee.getId(), year, month);

            if (existing.isPresent()) {
                continue;
            }

            toSave.add(BonusParamsSnapshot.builder()
                    .employee(employee)
                    .year(year)
                    .month(month)
                    .bonusPercent(employee.getBonusPercent())
                    .saleBonusPercent(employee.getSaleBonusPercent())
                    .boostNetRate(boostNetRate)
                    .bonusThreshold(bonusThreshold)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        if (!toSave.isEmpty()) {
            List<BonusParamsSnapshot> saved = bonusParamsSnapshotRepo.saveAll(toSave);
            for (BonusParamsSnapshot snapshot : saved) {
                auditLogService.logCreate("BonusParamsSnapshot", snapshot.getId(),
                        snapshot.getEmployee().getName() + " " + snapshot.getYear() + "/" + snapshot.getMonth(), snapshot);
            }
        }
    }

    @Override
    public Optional<BonusParamsSnapshot> getSnapshot(Long employeeId, int year, int month) {
        return bonusParamsSnapshotRepo.findByEmployeeIdAndYearAndMonth(employeeId, year, month);
    }
}
