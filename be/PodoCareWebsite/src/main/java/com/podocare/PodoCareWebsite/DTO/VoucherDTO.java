package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Voucher;
import com.podocare.PodoCareWebsite.model.constants.VoucherStatus;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VoucherDTO {
    private Long id;
    private Double value;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private ClientDTO client;
    private VoucherStatus status;
    private Long purchaseVisitId;

    public VoucherDTO(Voucher voucher) {
        this.id = voucher.getId();
        this.value = voucher.getValue();
        this.issueDate = voucher.getIssueDate();
        this.expiryDate = voucher.getExpiryDate();
        this.client = new ClientDTO(voucher.getClient());
        this.status = voucher.getStatus();
    }
    public VoucherDTO(Voucher voucher, Long sourceId) {
        this.id = voucher.getId();
        this.value = voucher.getValue();
        this.issueDate = voucher.getIssueDate();
        this.expiryDate = voucher.getExpiryDate();
        this.client = new ClientDTO(voucher.getClient());
        this.status = voucher.getStatus();
        this.purchaseVisitId = sourceId;
    }

    public Voucher toEntity() {

        return Voucher.builder()
                .id(this.id)
                .value(this.value)
                .issueDate(this.issueDate)
                .expiryDate(this.expiryDate)
                .client(this.client != null ? this.client.toEntity() : null)
                .status(this.status)
                .build();
    }
}
