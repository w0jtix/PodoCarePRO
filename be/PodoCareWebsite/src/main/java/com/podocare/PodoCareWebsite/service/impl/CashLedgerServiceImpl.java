package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.CashLedgerDTO;
import com.podocare.PodoCareWebsite.DTO.request.CashLedgerFilterDTO;
import com.podocare.PodoCareWebsite.config.security.services.UserDetailsImpl;
import com.podocare.PodoCareWebsite.exceptions.ConflictException;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.CashLedger;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.repo.CashLedgerRepo;
import com.podocare.PodoCareWebsite.repo.EmployeeRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.CashLedgerService;
import com.podocare.PodoCareWebsite.utils.SessionUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class CashLedgerServiceImpl implements CashLedgerService {

    private final CashLedgerRepo cashLedgerRepo;
    private final EmployeeRepo employeeRepo;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public CashLedgerDTO openCashLedger(CashLedgerDTO dto) {
        try {
            if (cashLedgerRepo.existsByDate(dto.getDate())) {
                throw new ConflictException("Cash ledger already exists for date: " + dto.getDate());
            }

            if (cashLedgerRepo.existsByIsClosedFalse()) {
                throw new ConflictException("Cannot open a new cash ledger while another one is still open.");
            }

            Employee employee = getEmployeeFromSession();

            CashLedger cashLedger = CashLedger.builder()
                    .date(dto.getDate())
                    .openingAmount(dto.getOpeningAmount())
                    .deposit(dto.getDeposit() != null ? dto.getDeposit() : 0.0)
                    .createdBy(employee)
                    .build();

            CashLedger saved = cashLedgerRepo.save(cashLedger);

            CashLedgerDTO savedDTO = new CashLedgerDTO(saved);
            auditLogService.logCreate("CashLedger", saved.getId(),
                    "Otwarcie Kasetki: " + saved.getDate(), savedDTO);

            return savedDTO;
        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new CreationException("Failed to open cash ledger. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public CashLedgerDTO closeCashLedger(Long id, CashLedgerDTO dto) {
        try {
            CashLedger cashLedger = cashLedgerRepo.findByIdWithDetails(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Cash ledger not found with id: " + id));

            if (Boolean.TRUE.equals(cashLedger.getIsClosed())) {
                throw new ConflictException("Cash ledger is already closed for date: " + cashLedger.getDate());
            }

            CashLedgerDTO oldSnapshot = new CashLedgerDTO(cashLedger);

            Employee employee = getEmployeeFromSession();

            cashLedger.setClosingAmount(dto.getClosingAmount());
            cashLedger.setCashOutAmount(dto.getCashOutAmount() != null ? dto.getCashOutAmount() : 0.0);
            cashLedger.setNote(dto.getNote());
            cashLedger.setClosedBy(employee);
            cashLedger.setIsClosed(true);

            CashLedger saved = cashLedgerRepo.save(cashLedger);

            CashLedgerDTO savedDTO = new CashLedgerDTO(saved);
            auditLogService.logUpdate("CashLedger", id,
                    "Zamknięcie kasetki: " + saved.getDate(), oldSnapshot, savedDTO);

            return savedDTO;
        } catch (ConflictException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new UpdateException("Failed to close cash ledger. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public CashLedgerDTO updateCashLedger(Long id, CashLedgerDTO dto) {
        try {
            CashLedger cashLedger = cashLedgerRepo.findByIdWithDetails(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Cash ledger not found with id: " + id));

            CashLedgerDTO oldSnapshot = new CashLedgerDTO(cashLedger);

            if (dto.getOpeningAmount() != null) cashLedger.setOpeningAmount(dto.getOpeningAmount());
            if (dto.getDeposit() != null) cashLedger.setDeposit(dto.getDeposit());
            if (dto.getClosingAmount() != null) cashLedger.setClosingAmount(dto.getClosingAmount());
            if (dto.getCashOutAmount() != null) cashLedger.setCashOutAmount(dto.getCashOutAmount());
            if (dto.getNote() != null) cashLedger.setNote(dto.getNote());
            if (dto.getIsClosed() != null) cashLedger.setIsClosed(dto.getIsClosed());

            CashLedger saved = cashLedgerRepo.save(cashLedger);

            CashLedgerDTO savedDTO = new CashLedgerDTO(saved);
            auditLogService.logUpdate("CashLedger", id,
                    "Korekta kasetki: " + saved.getDate(), oldSnapshot, savedDTO);

            return savedDTO;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new UpdateException("Failed to update cash ledger. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    public CashLedgerDTO getCashLedgerById(Long id) {
        return new CashLedgerDTO(cashLedgerRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cash ledger not found with id: " + id)));
    }

    @Override
    public CashLedgerDTO getTodayOpenLedger() {
        return cashLedgerRepo.findByDate(LocalDate.now())
                .map(CashLedgerDTO::new)
                .orElse(null);
    }

    @Override
    public Double getLastClosingAmount() {
        return cashLedgerRepo.findTopByIsClosedTrueOrderByDateDesc()
                .map(CashLedger::getClosingAmount)
                .orElse(null);
    }

    @Override
    public CashLedgerDTO getLastOpenCashLedger() {
        return cashLedgerRepo.findTopByIsClosedFalseAndDateBeforeOrderByDateDesc(LocalDate.now())
                .map(CashLedgerDTO::new)
                .orElse(null);
    }

    @Override
    public CashLedgerDTO getCashLedgerByDate(LocalDate date) {
        return new CashLedgerDTO(cashLedgerRepo.findByDate(date)
                .orElseThrow(() -> new ResourceNotFoundException("Cash ledger not found for date: " + date)));
    }

    @Override
    public Page<CashLedgerDTO> getCashLedgers(CashLedgerFilterDTO filter, int page, int size) {
        if (isNull(filter)) {
            filter = new CashLedgerFilterDTO();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("date")));

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

        Page<CashLedger> ledgers = cashLedgerRepo.findAllWithFilters(
                filter.getEmployeeId(),
                dateFrom,
                dateTo,
                pageable);

        return ledgers.map(CashLedgerDTO::new);
    }

    private Employee getEmployeeFromSession() {
        UserDetailsImpl userDetails = SessionUtils.getUserDetailsFromSession();
        if (userDetails == null || userDetails.getEmployee() == null) {
            throw new ResourceNotFoundException("Could not resolve employee from session.");
        }
        return employeeRepo.findOneById(userDetails.getEmployee().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + userDetails.getEmployee().getId()));
    }
}
