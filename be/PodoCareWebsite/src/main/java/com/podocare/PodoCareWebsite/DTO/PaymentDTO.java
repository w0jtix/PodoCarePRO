package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Payment;
import com.podocare.PodoCareWebsite.model.constants.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDTO {
    private Long id;
    private PaymentMethod method;
    private Double amount;
    private VoucherDTO voucher;

    public PaymentDTO (Payment payment) {
        this.id = payment.getId();
        this.method = payment.getMethod();
        this.amount = payment.getAmount();
        this.voucher = payment.getVoucher() != null ? new VoucherDTO(payment.getVoucher()) : null;
    }


    public Payment toEntity() {
        return Payment.builder()
                .id(this.id)
                .method(this.method)
                .amount(this.amount)
                .voucher(this.voucher != null ? this.voucher.toEntity() : null)
                .build();
    }
}
