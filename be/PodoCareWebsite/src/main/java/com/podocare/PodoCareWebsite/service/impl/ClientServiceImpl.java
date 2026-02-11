package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.DTO.request.ClientFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Client;
import com.podocare.PodoCareWebsite.model.ClientDebt;
import com.podocare.PodoCareWebsite.model.Sale;
import com.podocare.PodoCareWebsite.repo.*;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.ClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {
    private final ClientRepo clientRepo;
    private final VisitRepo visitRepo;
    private final ClientDebtRepo clientDebtRepo;
    private final VoucherRepo voucherRepo;
    private final ReviewRepo reviewRepo;
    private final AuditLogService auditLogService;

    @Override
    public ClientDTO getClientById(Long id) {
        return new ClientDTO(clientRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with given id: " + id)));
    }

    @Override
    public List<ClientDTO> getClients(ClientFilterDTO filter) {
        if(isNull(filter)) {
            filter = new ClientFilterDTO();
        }
        return clientRepo.findAllWithFilters(
                filter.getKeyword(),
                filter.getBoostClient(),
                filter.getSignedRegulations(),
                filter.getHasDebts(),
                filter.getDiscountId());
    }

    @Override
    @Transactional
    public ClientDTO createClient(ClientDTO clientDTO) {
        try{
            Client saved = clientRepo.save(clientDTO.toEntity());
            auditLogService.logCreate("Client", saved.getId(), saved.getFirstName() + saved.getLastName(), saved);
            return new ClientDTO(saved);
        } catch(Exception e) {
            throw new CreationException("Failed to create Client. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ClientDTO updateClient(Long id, ClientDTO clientDTO) {
        try{
            Client oldClient = clientRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with given id: " + id));

            ClientDTO oldClientSnapshot = new ClientDTO(oldClient);

            clientDTO.setId(id);
            Client saved = clientRepo.save(clientDTO.toEntity());
            auditLogService.logUpdate("Client", id, oldClientSnapshot.getFirstName() + oldClientSnapshot.getLastName(), oldClientSnapshot, new ClientDTO(saved));
            return new ClientDTO(saved);
        } catch(Exception e) {
            throw new UpdateException("Failed to update Client. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteClientById(Long id) {
        try {
            Client client = clientRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

            if (client.getIsDeleted()) {
                throw new DeletionException("Client is already soft-deleted.");
            }

            if (hasVisitReferences(id) || hasClientDebtReferences(id) ||
                hasVoucherReferences(id) || hasReviewReferences(id)) {
                client.softDelete();
                clientRepo.save(client);
            } else {
                clientRepo.deleteById(id);
            }

            auditLogService.logDelete("Client", id, client.getFirstName() + client.getLastName(), client);
        } catch (ResourceNotFoundException | DeletionException e) {
            throw e;
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Client, Reason: " + e.getMessage(), e);
        }
    }

    private boolean hasVisitReferences(Long clientId) {
        return visitRepo.existsByClientId(clientId);
    }

    private boolean hasClientDebtReferences(Long clientId) {
        return clientDebtRepo.existsByClientId(clientId);
    }

    private boolean hasVoucherReferences(Long clientId) {
        return voucherRepo.existsByClientId(clientId);
    }

    private boolean hasReviewReferences(Long clientId) {
        return reviewRepo.existsByClientId(clientId);
    }
}
