package com.podocare.PodoCareWebsite.DTO.request;

import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DebtFilterDTO {
    private PaymentStatus paymentStatus;
    private String keyword;
}
