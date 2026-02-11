package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ClientNoteDTO;
import com.podocare.PodoCareWebsite.service.ClientNoteService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/client-notes")
public class ClientNoteController {
    private final ClientNoteService clientNoteService;

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientNoteDTO> getClientNoteById(@PathVariable(value = "id") Long id) {
        ClientNoteDTO clientNote = clientNoteService.getClientNoteById(id);
        return new ResponseEntity<>(clientNote, HttpStatus.OK);
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<ClientNoteDTO>> getClientNotesByClientId(@PathVariable(value = "clientId") Long clientId) {
        List<ClientNoteDTO> clientNotes = clientNoteService.getClientNotesByClientId(clientId);
        return new ResponseEntity<>(clientNotes, clientNotes.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientNoteDTO> createClientNote(@NonNull @RequestBody ClientNoteDTO clientNote) {
        ClientNoteDTO createdClientNote = clientNoteService.createClientNote(clientNote);
        return new ResponseEntity<>(createdClientNote, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientNoteDTO> updateClientNote(@PathVariable(value = "id") Long id, @NonNull @RequestBody ClientNoteDTO clientNote) {
        ClientNoteDTO saved = clientNoteService.updateClientNote(id, clientNote);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteClientNote(@PathVariable(value = "id") Long id) {
        clientNoteService.deleteClientNoteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
