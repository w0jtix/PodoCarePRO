package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.CashLedgerDTO;
import com.podocare.PodoCareWebsite.DTO.request.CashLedgerFilterDTO;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface CashLedgerService {

    CashLedgerDTO openCashLedger(CashLedgerDTO dto);

    CashLedgerDTO closeCashLedger(Long id, CashLedgerDTO dto);

    CashLedgerDTO updateCashLedger(Long id, CashLedgerDTO dto);

    CashLedgerDTO getCashLedgerById(Long id);

    CashLedgerDTO getCashLedgerByDate(LocalDate date);

    CashLedgerDTO getTodayOpenLedger();

    Double getLastClosingAmount();

    CashLedgerDTO getLastOpenCashLedger();

    Page<CashLedgerDTO> getCashLedgers(CashLedgerFilterDTO filter, int page, int size);
}
