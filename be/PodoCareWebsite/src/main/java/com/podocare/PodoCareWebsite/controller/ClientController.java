package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ClientDTO;
import com.podocare.PodoCareWebsite.DTO.ClientDTO;
import com.podocare.PodoCareWebsite.DTO.request.ClientFilterDTO;
import com.podocare.PodoCareWebsite.service.ClientService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/clients")
public class ClientController {
    private final ClientService clientService;

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientDTO> getClientById(@PathVariable(value = "id") Long id) {
        ClientDTO client = clientService.getClientById(id);
        return new ResponseEntity<>(client, HttpStatus.OK);
    }

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<ClientDTO>> getClients(@RequestBody(required = false) ClientFilterDTO filter) {
        List<ClientDTO> clientList = clientService.getClients(filter);
        return new ResponseEntity<>(clientList, clientList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientDTO> createClient(@NonNull @RequestBody ClientDTO client) {
        ClientDTO createdClient = clientService.createClient(client);
        return  new ResponseEntity<>(createdClient, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientDTO> updateClient(@PathVariable(value = "id") Long id, @NonNull @RequestBody ClientDTO client) {
        ClientDTO saved = clientService.updateClient(id, client);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteClient(@PathVariable(value = "id") Long id) {
        clientService.deleteClientById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
