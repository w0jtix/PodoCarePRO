package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.ClientDebtDTO;
import com.podocare.PodoCareWebsite.DTO.request.DebtFilterDTO;

import java.util.List;

public interface ClientDebtService {

    ClientDebtDTO getDebtById(Long id);

    ClientDebtDTO getDebtBySourceVisitId(Long sourceVisitId);

    List<ClientDebtDTO> getDebts (DebtFilterDTO filter);

    List<ClientDebtDTO> getUnpaidDebtsByClientId(Long id);

    ClientDebtDTO createDebt(ClientDebtDTO debt);

    ClientDebtDTO updateDebt(Long id, ClientDebtDTO debt);

    void deleteDebtById(Long id);
}
