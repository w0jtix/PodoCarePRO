package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.InventoryReportDTO;
import com.podocare.PodoCareWebsite.DTO.InventoryReportItemDTO;
import com.podocare.PodoCareWebsite.DTO.request.InventoryReportFilterDTO;
import com.podocare.PodoCareWebsite.config.security.services.UserDetailsImpl;
import com.podocare.PodoCareWebsite.exceptions.ConflictException;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.model.InventoryReport;
import com.podocare.PodoCareWebsite.model.InventoryReportItem;
import com.podocare.PodoCareWebsite.model.Product;
import com.podocare.PodoCareWebsite.repo.EmployeeRepo;
import com.podocare.PodoCareWebsite.repo.InventoryReportRepo;
import com.podocare.PodoCareWebsite.repo.ProductRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.InventoryReportService;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import com.podocare.PodoCareWebsite.utils.SessionUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class InventoryReportServiceImpl implements InventoryReportService {

    private final InventoryReportRepo inventoryReportRepo;
    private final EmployeeRepo employeeRepo;
    private final ProductRepo productRepo;
    private final AuditLogService auditLogService;

    @Override
    public InventoryReportDTO getReportById(Long id) {
        return new InventoryReportDTO(inventoryReportRepo.findOneByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory report not found with id: " + id)));
    }

    @Override
    public Page<InventoryReportDTO> getReports(InventoryReportFilterDTO filter, int page, int size) {
        if (isNull(filter)) {
            filter = new InventoryReportFilterDTO();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));

        LocalDate dateFrom;
        LocalDate dateTo;

        if (filter.getYear() == null) {
            dateFrom = LocalDate.of(1900, 1, 1);
            dateTo = LocalDate.now();
        } else if (filter.getMonth() != null) {
            dateFrom = LocalDate.of(filter.getYear(), filter.getMonth(), 1);
            dateTo = dateFrom.withDayOfMonth(dateFrom.lengthOfMonth());
        } else {
            dateFrom = LocalDate.of(filter.getYear(), 1, 1);
            dateTo = LocalDate.of(filter.getYear(), 12, 31);
        }

        Page<InventoryReport> reports = inventoryReportRepo.findAllWithFilters(
                filter.getEmployeeId(),
                dateFrom,
                dateTo,
                pageable);

        return reports.map(InventoryReportDTO::new);
    }

    @Override
    @Transactional
    public InventoryReportDTO createReport(InventoryReportDTO reportDTO) {
        try {
            if (!areAllApproved()) {
                throw new ConflictException("Cannot create a new report while there are unapproved reports.");
            }

            UserDetailsImpl userDetails = SessionUtils.getUserDetailsFromSession();
            if (userDetails == null || userDetails.getEmployee() == null) {
                throw new ResourceNotFoundException("Could not resolve employee from session.");
            }

            Employee employee = employeeRepo.findOneById(userDetails.getEmployee().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + userDetails.getEmployee().getId()));

            InventoryReport report = InventoryReport.builder()
                    .createdBy(employee)
                    .createdAt(LocalDate.now())
                    .build();

            for (InventoryReportItemDTO itemDTO : reportDTO.getItems()) {
                Product product = productRepo.findByIdNotDeleted(itemDTO.getProduct().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDTO.getProduct().getId()));

                Integer supplyBefore = product.getSupply();
                Integer supplyAfter = Math.max(itemDTO.getSupplyAfter(), 0);

                InventoryReportItem item = InventoryReportItem.builder()
                        .product(product)
                        .supplyBefore(supplyBefore)
                        .supplyAfter(supplyAfter)
                        .build();

                report.addItem(item);

                product.setSupply(supplyAfter);
                productRepo.save(product);
            }

            InventoryReport savedReport = inventoryReportRepo.save(report);

            InventoryReportDTO savedDTO = new InventoryReportDTO(savedReport);
            auditLogService.logCreate("InventoryReport", savedReport.getId(),
                    "Raport Stanu Mag.", savedDTO);

            return savedDTO;
        } catch (ResourceNotFoundException | ConflictException e) {
            throw e;
        } catch (Exception e) {
            throw new CreationException("Failed to create Inventory Report. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public InventoryReportDTO updateReport(Long id, InventoryReportDTO reportDTO) {
        try {
            InventoryReport report = inventoryReportRepo.findOneByIdWithDetails(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory report not found with id: " + id));

            if (isEffectivelyApproved(report)) {
                throw new ConflictException("Approved Report cannot be updated.");
            }

            InventoryReportDTO oldReportSnapshot = new InventoryReportDTO(report);

            revertSupplyAdjustments(report);

            report.getItems().clear();

            for (InventoryReportItemDTO itemDTO : reportDTO.getItems()) {
                Product product = productRepo.findByIdNotDeleted(itemDTO.getProduct().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDTO.getProduct().getId()));

                Integer supplyBefore = product.getSupply();
                Integer supplyAfter = Math.max(itemDTO.getSupplyAfter(), 0);

                InventoryReportItem item = InventoryReportItem.builder()
                        .product(product)
                        .supplyBefore(supplyBefore)
                        .supplyAfter(supplyAfter)
                        .build();

                report.addItem(item);

                product.setSupply(supplyAfter);
                productRepo.save(product);
            }

            InventoryReport savedReport = inventoryReportRepo.save(report);

            InventoryReportDTO savedDTO = new InventoryReportDTO(savedReport);
            auditLogService.logUpdate("InventoryReport", id, "Raport Stanu Mag.", oldReportSnapshot, savedDTO);

            return savedDTO;
        } catch (ResourceNotFoundException | ConflictException e) {
            throw e;
        } catch (Exception e) {
            throw new UpdateException("Failed to update Inventory Report. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public InventoryReportDTO approveReport(Long id) {
        if (!SessionUtils.hasUserRole(RoleType.ROLE_ADMIN)) {
            throw new ConflictException("Only ADMIN can approve Reports.");
        }

        InventoryReport report = inventoryReportRepo.findOneByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory report not found with id: " + id));

        if (isEffectivelyApproved(report)) {
            throw new ConflictException("Report is already approved.");
        }

        report.setApproved(true);
        InventoryReport savedReport = inventoryReportRepo.save(report);

        InventoryReportDTO savedDTO = new InventoryReportDTO(savedReport);
        auditLogService.logCreate("InventoryReport", id, "Zatwierdzenie Raportu Stanu Mag.",  savedDTO);

        return savedDTO;
    }

    @Override
    public boolean areAllApproved() {
        return !inventoryReportRepo.existsByApprovedFalse();
    }

    private void validateRevertIsPossible(InventoryReport report) {
        List<String> conflicts = new ArrayList<>();

        for (InventoryReportItem item : report.getItems()) {
            Product product = item.getProduct();
            int delta = item.getSupplyAfter() - item.getSupplyBefore();
            int revertedSupply = product.getSupply() - delta;

            if (revertedSupply < 0) {
                conflicts.add(String.format(
                        "%s: stan obecny = %d, zmiana raportu = %+d, po cofnięciu = %d (brakuje %d szt.)",
                        product.getName(),
                        product.getSupply(),
                        delta,
                        revertedSupply,
                        Math.abs(revertedSupply)
                ));
            }
        }

        if (!conflicts.isEmpty()) {
            throw new ConflictException(
                    "Nie można cofnąć raportu - cofnięcie spowodowałoby ujemny stan magazynowy:\n"
                            + String.join("\n", conflicts)
            );
        }
    }

    private void revertSupplyAdjustments(InventoryReport report) {
        validateRevertIsPossible(report);

        for (InventoryReportItem item : report.getItems()) {
            Product product = item.getProduct();
            int delta = item.getSupplyAfter() - item.getSupplyBefore();
            product.setSupply(product.getSupply() - delta);
            productRepo.save(product);
        }
    }

    private boolean isEffectivelyApproved(InventoryReport report) {
        if (Boolean.TRUE.equals(report.getApproved())) {
            return true;
        }
        LocalDate cutoff = LocalDate.now().withDayOfMonth(1);
        return report.getCreatedAt().isBefore(cutoff);
    }

    @Override
    @Transactional
    public void deleteReportById(Long id) {
        try {
            InventoryReport report = inventoryReportRepo.findOneByIdWithDetails(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Inventory report not found with id: " + id));

            if (isEffectivelyApproved(report)) {
                throw new ConflictException("Approved Report cannot be deleted.");
            }

            InventoryReportDTO reportSnapshot = new InventoryReportDTO(report);

            revertSupplyAdjustments(report);

            inventoryReportRepo.delete(report);

            auditLogService.logDelete("InventoryReport", id,
                    "Raport inwentaryzacji: " + report.getCreatedBy().getName() + " " + report.getCreatedBy().getLastName(),
                    reportSnapshot);
        } catch (ResourceNotFoundException | ConflictException e) {
            throw e;
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Inventory Report. Reason: " + e.getMessage(), e);
        }
    }
}
