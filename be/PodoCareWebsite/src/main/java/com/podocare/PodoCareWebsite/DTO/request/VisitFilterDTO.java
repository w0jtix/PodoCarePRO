package com.podocare.PodoCareWebsite.DTO.request;

import com.podocare.PodoCareWebsite.model.constants.PaymentMethod;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class VisitFilterDTO {
    private List<Long> clientIds;
    private List<Long> serviceIds;
    private List<Long> employeeIds;
    private Boolean isBoost;
    private Boolean isVip;
    private Boolean delayed;
    private Boolean absence;
    private Boolean hasDiscount;
    private Boolean hasSale;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private PaymentStatus paymentStatus;
    private Double totalValueFrom;
    private Double totalValueTo;
}
