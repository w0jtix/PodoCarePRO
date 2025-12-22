package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.ClientDTO;
import com.podocare.PodoCareWebsite.DTO.request.ClientFilterDTO;

import java.util.List;

public interface ClientService {

    ClientDTO getClientById(Long id);

    List<ClientDTO> getClients(ClientFilterDTO filter);

    ClientDTO createClient(ClientDTO client);

    ClientDTO updateClient(Long id, ClientDTO client);

    void deleteClientById(Long id);
}
