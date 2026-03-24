package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.CashLedgerDTO;
import com.podocare.PodoCareWebsite.DTO.request.CashLedgerFilterDTO;
import com.podocare.PodoCareWebsite.service.CashLedgerService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cash-ledger")
public class CashLedgerController {

    private final CashLedgerService cashLedgerService;

    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CashLedgerDTO>> getCashLedgers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "40") int size,
            @RequestBody CashLedgerFilterDTO filter) {
        Page<CashLedgerDTO> ledgersPage = cashLedgerService.getCashLedgers(filter, page, size);
        return new ResponseEntity<>(ledgersPage, ledgersPage.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashLedgerDTO> getCashLedgerById(@PathVariable(value = "id") Long id) {
        CashLedgerDTO ledger = cashLedgerService.getCashLedgerById(id);
        return new ResponseEntity<>(ledger, HttpStatus.OK);
    }

    @GetMapping("/last-open")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CashLedgerDTO> getLastOpenCashLedger() {
        CashLedgerDTO ledger = cashLedgerService.getLastOpenCashLedger();
        if (ledger == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(ledger, HttpStatus.OK);
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CashLedgerDTO> getTodayLedger() {
        CashLedgerDTO ledger = cashLedgerService.getTodayOpenLedger();
        if (ledger == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(ledger, HttpStatus.OK);
    }

    @GetMapping("/last-closing-amount")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Double> getLastClosingAmount() {
        Double amount = cashLedgerService.getLastClosingAmount();
        if (amount == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(amount, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CashLedgerDTO> openCashLedger(@NonNull @RequestBody CashLedgerDTO dto) {
        CashLedgerDTO created = cashLedgerService.openCashLedger(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CashLedgerDTO> updateCashLedger(
            @PathVariable(value = "id") Long id,
            @NonNull @RequestBody CashLedgerDTO dto) {
        CashLedgerDTO updated = cashLedgerService.updateCashLedger(id, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<CashLedgerDTO> closeCashLedger(
            @PathVariable(value = "id") Long id,
            @NonNull @RequestBody CashLedgerDTO dto) {
        CashLedgerDTO closed = cashLedgerService.closeCashLedger(id, dto);
        return new ResponseEntity<>(closed, HttpStatus.OK);
    }
}
