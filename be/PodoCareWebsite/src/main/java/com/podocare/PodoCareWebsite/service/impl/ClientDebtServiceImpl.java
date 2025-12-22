package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.ClientDebtDTO;
import com.podocare.PodoCareWebsite.DTO.request.ClientFilterDTO;
import com.podocare.PodoCareWebsite.DTO.request.DebtFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.constants.DebtType;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import com.podocare.PodoCareWebsite.repo.ClientDebtRepo;
import com.podocare.PodoCareWebsite.service.ClientDebtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class ClientDebtServiceImpl implements ClientDebtService {

    private final ClientDebtRepo debtRepo;

    @Override
    public ClientDebtDTO getDebtById(Long id) {
        return new ClientDebtDTO(debtRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Debt not found with given id: " + id)));
    }

    @Override
    public ClientDebtDTO getDebtBySourceVisitId(Long sourceVisitId) {
        return debtRepo.findOneBySourceVisitId(sourceVisitId)
                .map(ClientDebtDTO::new)
                .orElse(null);
    }

    @Override
    public List<ClientDebtDTO> getDebts(DebtFilterDTO filter) {
        if(isNull(filter)) {
            filter = new DebtFilterDTO();
        }

        return debtRepo.findAllWithFilters(
                filter.getPaymentStatus(),
                filter.getKeyword()
                )
                .stream()
                .map(ClientDebtDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClientDebtDTO> getUnpaidDebtsByClientId(Long id) {
        return debtRepo.findAllByClientIdAndPaymentStatus(id, PaymentStatus.UNPAID).stream()
                .map(ClientDebtDTO:: new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClientDebtDTO createDebt(ClientDebtDTO debt) {
        try{
            return new ClientDebtDTO(debtRepo.save(debt.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create ClientDebt: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ClientDebtDTO updateDebt(Long id, ClientDebtDTO debt) {
        try{
            getDebtById(id);

            debt.setId(id);
            return new ClientDebtDTO(debtRepo.save(debt.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update ClientDebt, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteDebtById(Long id) {
        try{
            debtRepo.deleteById(getDebtById(id).getId());
        } catch (Exception e) {
            throw new DeletionException("Failed to delete ClientDebt, Reason: " + e.getMessage(), e);
        }
    }
}
