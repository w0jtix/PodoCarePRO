package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.ClientNoteDTO;

import java.util.List;

public interface ClientNoteService {

    ClientNoteDTO getClientNoteById(Long id);

    List<ClientNoteDTO> getClientNotesByClientId(Long clientId);

    ClientNoteDTO createClientNote(ClientNoteDTO clientNote);

    ClientNoteDTO updateClientNote(Long id, ClientNoteDTO clientNote);

    void deleteClientNoteById(Long id);
}
