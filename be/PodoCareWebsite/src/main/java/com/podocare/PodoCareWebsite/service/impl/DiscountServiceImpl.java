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
            return new DiscountDTO(newDiscount);
        } catch(Exception e) {
            throw new CreationException("Failed to create Discount. Reason: " +e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public DiscountDTO updateDiscount(Long id, DiscountDTO discount) {
        try{
            getDiscountById(id);
            discount.setId(id);
            Discount updatedDiscount = discountRepo.save(discount.toEntity());

            List<Client> currentClients = clientRepo.findAllByDiscountId(id);
            boolean clientsChanged = checkIfClientListChanged(currentClients, discount.getClients());

            if(clientsChanged) {
                List<Client> clientsWithDiscountId = clientRepo.findAllByDiscountId(id);
                if(!clientsWithDiscountId.isEmpty()) {
                    unassignDiscountFromClients(clientsWithDiscountId);
                }
                if(discount.getClients() != null && !discount.getClients().isEmpty()) {
                    assignDiscountToClients(discount.getClients(), updatedDiscount);
                }
            }

            return new DiscountDTO(updatedDiscount);
        } catch(Exception e) {
            throw new UpdateException("Failed to update Discount. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteDiscountById(Long id) {
        try {
            getDiscountById(id);
            
            List<Client> clientsWithDiscountId = clientRepo.findAllByDiscountId(id);
            if(!clientsWithDiscountId.isEmpty()) {
                unassignDiscountFromClients(clientsWithDiscountId);
            }

            discountRepo.deleteById(id);
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
}
