package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.ClientNote;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientNoteDTO {
    private Long id;
    private String content;
    private LocalDate createdAt;
    private EmployeeDTO createdBy;
    private ClientDTO client;

    public ClientNoteDTO(ClientNote clientNote) {
        this.id = clientNote.getId();
        this.content = clientNote.getContent();
        this.createdAt = clientNote.getCreatedAt();
        this.createdBy = new EmployeeDTO(clientNote.getCreatedBy());
        this.client = new ClientDTO(clientNote.getClient());
    }

    public ClientNote toEntity() {
        return ClientNote.builder()
                .id(this.id)
                .content(this.content)
                .createdAt(this.createdAt)
                .createdBy(this.createdBy != null ? this.createdBy.toEntity() : null)
                .client(this.client != null ? this.client.toEntity() : null)
                .build();
    }
}
