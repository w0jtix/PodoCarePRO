package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.ClientNoteDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.Client;
import com.podocare.PodoCareWebsite.model.ClientNote;
import com.podocare.PodoCareWebsite.model.Employee;
import com.podocare.PodoCareWebsite.repo.ClientNoteRepo;
import com.podocare.PodoCareWebsite.repo.ClientRepo;
import com.podocare.PodoCareWebsite.repo.EmployeeRepo;
import com.podocare.PodoCareWebsite.service.ClientNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientNoteServiceImpl implements ClientNoteService {
    private final ClientNoteRepo clientNoteRepo;
    private final ClientRepo clientRepo;
    private final EmployeeRepo employeeRepo;

    @Override
    public ClientNoteDTO getClientNoteById(Long id) {
        return new ClientNoteDTO(clientNoteRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClientNote not found with given id: " + id)));
    }

    @Override
    public List<ClientNoteDTO> getClientNotesByClientId(Long clientId) {
        return clientNoteRepo.findByClientId(clientId).stream()
                .map(ClientNoteDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClientNoteDTO createClientNote(ClientNoteDTO clientNoteDTO) {
        try {

            return new ClientNoteDTO(clientNoteRepo.save(clientNoteDTO.toEntity()));
        } catch (Exception e) {
            throw new CreationException("Failed to create ClientNote. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public ClientNoteDTO updateClientNote(Long id, ClientNoteDTO clientNoteDTO) {
        try {
            getClientNoteById(id);
            clientNoteDTO.setId(id);

            return new ClientNoteDTO(clientNoteRepo.save(clientNoteDTO.toEntity()));
        } catch (Exception e) {
            throw new UpdateException("Failed to update ClientNote. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteClientNoteById(Long id) {
        try {
            getClientNoteById(id);
            clientNoteRepo.deleteById(id);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete ClientNote. Reason: " + e.getMessage(), e);
        }
    }
}
