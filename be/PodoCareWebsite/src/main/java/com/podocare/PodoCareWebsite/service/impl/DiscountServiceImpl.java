package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.ClientDTO;
import com.podocare.PodoCareWebsite.DTO.DiscountDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Client;
import com.podocare.PodoCareWebsite.model.Discount;
import com.podocare.PodoCareWebsite.repo.ClientRepo;
import com.podocare.PodoCareWebsite.repo.DiscountRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiscountServiceImpl implements DiscountService {
    private final DiscountRepo discountRepo;
    private final ClientRepo clientRepo;
    private final AuditLogService auditLogService;

    @Override
    public DiscountDTO getDiscountById(Long id) {
        return new DiscountDTO(discountRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with given id: " + id)));
    }

    @Override
    public List<DiscountDTO> getDiscounts() {
        return discountRepo.findAllWithClientCount();
    }

    @Override
    @Transactional
    public DiscountDTO createDiscount(DiscountDTO discount) {
        try{
            Discount newDiscount = discountRepo.save(discount.toEntity());

            if(discount.getClients() != null && !discount.getClients().isEmpty()) {
                assignDiscountToClients(discount.getClients(), newDiscount);
            }
            DiscountDTO savedDiscount = new DiscountDTO(newDiscount);
            auditLogService.logCreate("Discount", savedDiscount.getId(), "Zniżka: " + savedDiscount.getName(), savedDiscount);
            logDiscountClientChanges(savedDiscount.getId(), savedDiscount.getName(), List.of(), discount.getClients());
            return savedDiscount;
        } catch(Exception e) {
            throw new CreationException("Failed to create Discount. Reason: " +e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public DiscountDTO updateDiscount(Long id, DiscountDTO discount) {
        try{
            DiscountDTO oldDiscountSnapshot = getDiscountById(id);
            discount.setId(id);
            Discount updatedDiscount = discountRepo.save(discount.toEntity());

            List<Client> currentClients = clientRepo.findAllByDiscountId(id);
            boolean clientsChanged = checkIfClientListChanged(currentClients, discount.getClients());

            if(clientsChanged) {
                logDiscountClientChanges(id, oldDiscountSnapshot.getName(), currentClients, discount.getClients());

                if(!currentClients.isEmpty()) {
                    unassignDiscountFromClients(currentClients);
                }
                if(discount.getClients() != null && !discount.getClients().isEmpty()) {
                    assignDiscountToClients(discount.getClients(), updatedDiscount);
                }
            }

            DiscountDTO savedDiscount = new DiscountDTO(updatedDiscount);
            auditLogService.logUpdate("Discount", id, "Zniżka: " + oldDiscountSnapshot.getName(), oldDiscountSnapshot, savedDiscount);
            return savedDiscount;
        } catch(Exception e) {
            throw new UpdateException("Failed to update Discount. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteDiscountById(Long id) {
        try {
            DiscountDTO discountSnapshot = getDiscountById(id);

            List<Client> clientsWithDiscountId = clientRepo.findAllByDiscountId(id);
            if(!clientsWithDiscountId.isEmpty()) {
                unassignDiscountFromClients(clientsWithDiscountId);
            }

            discountRepo.deleteById(id);
            logDiscountClientChanges(id, discountSnapshot.getName(), clientsWithDiscountId, null);
            auditLogService.logDelete("Discount", id, "Zniżka: " + discountSnapshot.getName(), discountSnapshot);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Discount, Reason: " + e.getMessage(), e);
        }
    }

    private boolean checkIfClientListChanged(List<Client> currentClients, List<ClientDTO> newClientList) {
        if (newClientList == null) {
            newClientList = List.of();
        }
        List<Long> currentClientIds = currentClients.stream()
                .map(Client::getId)
                .collect(Collectors.toList());
        List<Long> newClientIds = newClientList.stream()
                .map(ClientDTO::getId)
                .collect(Collectors.toList());

        return !new java.util.HashSet<>(newClientIds)
                .equals(new java.util.HashSet<>(currentClientIds));
    }

    private void unassignDiscountFromClients(List<Client> clientList) {
        clientList.forEach(c -> c.setDiscount(null));
        clientRepo.saveAll(clientList);
    }

    private void assignDiscountToClients(List<ClientDTO> clientList, Discount discount) {
        List<Long> clientIds = clientList.stream()
                .map(ClientDTO::getId)
                .toList();
        List<Client> clients = clientRepo.findAllById(clientIds);
        clients.forEach(c -> c.setDiscount(discount));
        clientRepo.saveAll(clients);
    }

    private void logDiscountClientChanges(Long discountId, String discountName, List<Client> oldClients, List<ClientDTO> newClients) {
        java.util.Set<Long> oldClientIds = oldClients.stream().map(Client::getId).collect(Collectors.toSet());
        java.util.Set<Long> newClientIds = newClients != null
                ? newClients.stream().map(ClientDTO::getId).collect(Collectors.toSet())
                : java.util.Collections.emptySet();

        List<String> removedClients = oldClients.stream()
                .filter(c -> !newClientIds.contains(c.getId()))
                .map(c -> c.getFirstName() + " " + c.getLastName())
                .collect(Collectors.toList());

        List<Long> addedClientIds = newClientIds.stream()
                .filter(cid -> !oldClientIds.contains(cid))
                .collect(Collectors.toList());
        List<String> addedClients = addedClientIds.isEmpty()
                ? List.of()
                : clientRepo.findAllById(addedClientIds).stream()
                        .map(c -> c.getFirstName() + " " + c.getLastName())
                        .collect(Collectors.toList());

        if (!removedClients.isEmpty()) {
            java.util.Map<String, Object> deleteState = new java.util.LinkedHashMap<>();
            deleteState.put("discountName", discountName);
            deleteState.put("clients", removedClients);
            auditLogService.logDelete("Discount-Clients", discountId, null,deleteState);
        }

        if (!addedClients.isEmpty()) {
            java.util.Map<String, Object> createState = new java.util.LinkedHashMap<>();
            createState.put("discountName", discountName);
            createState.put("clients", addedClients);
            auditLogService.logCreate("Discount-Clients", discountId, null, createState);
        }
    }
}
