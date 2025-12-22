package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Client;
import com.podocare.PodoCareWebsite.model.ClientDebt;
import com.podocare.PodoCareWebsite.model.constants.DebtType;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientDebtDTO {
    private Long id;
    private ClientDTO client;
    private VisitDTO sourceVisit;
    private DebtType type;
    private Double value;
    private PaymentStatus paymentStatus;
    private LocalDate createdAt;


    public ClientDebtDTO(ClientDebt clientDebt) {
        this.id = clientDebt.getId();
        this.client = new ClientDTO(clientDebt.getClient());
        this.sourceVisit = clientDebt.getSourceVisit() != null ? new VisitDTO(clientDebt.getSourceVisit()) : null;
        this.type = clientDebt.getType();
        this.value = clientDebt.getValue();
        this.paymentStatus = clientDebt.getPaymentStatus();
        this.createdAt = clientDebt.getCreatedAt();
    }

    public ClientDebt toEntity() {
        return ClientDebt.builder()
                .id(this.id)
                .client(this.client != null ? this.client.toEntity() : null)
                .sourceVisit(this.sourceVisit != null ? this.sourceVisit.toEntity() : null)
                .type(this.type)
                .value(this.value)
                .paymentStatus(this.paymentStatus != null ? this.paymentStatus : PaymentStatus.UNPAID)
                .createdAt(this.createdAt)
                .build();
    }

    public ClientDebt toEntity(Client client) {
        return ClientDebt.builder()
                .id(this.id)
                .client(client)
                .sourceVisit(this.sourceVisit != null ? this.sourceVisit.toEntity() : null)
                .type(this.type)
                .value(this.value)
                .paymentStatus(this.paymentStatus)
                .build();
    }
}
