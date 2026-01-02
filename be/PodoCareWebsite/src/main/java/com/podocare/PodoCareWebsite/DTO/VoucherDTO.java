package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Voucher;
import com.podocare.PodoCareWebsite.model.constants.VoucherStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

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
        this.status = recalculateStatus(voucher);
    }
    public VoucherDTO(Voucher voucher, Long sourceId) {
        this.id = voucher.getId();
        this.value = voucher.getValue();
        this.issueDate = voucher.getIssueDate();
        this.expiryDate = voucher.getExpiryDate();
        this.client = new ClientDTO(voucher.getClient());
        this.status = recalculateStatus(voucher);
        this.purchaseVisitId = sourceId;
    }
    //for development -> prod  will use scheduler in service
    private VoucherStatus recalculateStatus(Voucher voucher) {
        if (voucher.getStatus() == VoucherStatus.USED) {
            return VoucherStatus.USED;
        }
        if (voucher.getExpiryDate() != null && voucher.getExpiryDate().isBefore(LocalDate.now())) {
            return VoucherStatus.EXPIRED;
        }
        return VoucherStatus.ACTIVE;
    }

    public Voucher toEntity() {

        VoucherStatus finalStatus = this.status;

        if (finalStatus != VoucherStatus.USED) {
            if (this.expiryDate != null && this.expiryDate.isBefore(LocalDate.now())) {
                finalStatus = VoucherStatus.EXPIRED;
            } else {
                finalStatus = VoucherStatus.ACTIVE;
            }
        }

        return Voucher.builder()
                .id(this.id)
                .value(this.value)
                .issueDate(this.issueDate)
                .expiryDate(this.expiryDate)
                .client(this.client != null ? this.client.toEntity() : null)
                .status(finalStatus)
                .build();
    }
}
