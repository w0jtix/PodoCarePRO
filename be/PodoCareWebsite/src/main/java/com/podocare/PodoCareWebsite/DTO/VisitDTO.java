package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.*;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VisitDTO {
    private Long id;
    private ClientDTO client;
    private EmployeeDTO employee;
    private List<VisitDiscountDTO> serviceDiscounts = new ArrayList<>();
    private Boolean isBoost;
    private Boolean isVip;
    private Integer delayTime;
    private Boolean absence;
    private List<VisitItemDTO> items = new ArrayList<>();
    private SaleDTO sale;
    private List<DebtRedemptionDTO> debtRedemptions = new ArrayList<>();
    private LocalDate date;
    private PaymentStatus paymentStatus;
    private List<PaymentDTO> payments;

    private Double totalNet;
    private Double totalVat;
    private Double totalValue;
    private String notes;
    private Boolean receipt;

    public VisitDTO(Visit visit) {
        this.id = visit.getId();
        this.client = new ClientDTO(visit.getClient());
        this.employee = new EmployeeDTO(visit.getEmployee());
        this.isBoost = visit.getIsBoost();
        this.isVip = visit.getIsVip();
        this.delayTime = visit.getDelayTime();
        this.absence = visit.getAbsence();
        if(nonNull(visit.getServiceDiscounts())){
            this.serviceDiscounts = visit.getServiceDiscounts().stream()
                    .map(VisitDiscountDTO::new)
                    .collect(Collectors.toList());
        }
        if(nonNull(visit.getItems())) {
            this.items = visit.getItems().stream()
                    .map(VisitItemDTO::new)
                    .collect(Collectors.toList());
        }
        this.sale = visit.getSale() != null ? new SaleDTO(visit.getSale()) : null;
        if(nonNull(visit.getDebtRedemptions())) {
            this.debtRedemptions = visit.getDebtRedemptions().stream()
                    .map(DebtRedemptionDTO::new)
                    .collect(Collectors.toList());
        }
        this.date = visit.getDate();
        this.paymentStatus = visit.getPaymentStatus();
        if(nonNull(visit.getPayments())){
            this.payments = visit.getPayments().stream()
                    .map(PaymentDTO::new)
                    .collect(Collectors.toList());
        }
        this.totalNet = visit.getTotalNet();
        this.totalVat = visit.getTotalVat();
        this.totalValue = visit.getTotalValue();
        this.notes = visit.getNotes();
        this.receipt = visit.getReceipt();
    }

    public Visit toEntity() {
        Visit visit = Visit.builder()
                .id(this.id)
                .client(this.client != null ? this.client.toEntity() : null)
                .employee(this.employee != null ? this.employee.toEntity() : null)
                .isBoost(this.isBoost)
                .isVip(this.isVip)
                .delayTime(this.delayTime)
                .absence(this.absence)
                .items(new ArrayList<>())
                .sale(this.sale != null ? this.sale.toEntity() : null)
                .debtRedemptions(new ArrayList<>())
                .date(this.date)
                .paymentStatus(this.paymentStatus)
                .payments(new ArrayList<>())
                .totalNet(this.totalNet)
                .totalVat(this.totalVat)
                .totalValue(this.totalValue)
                .notes(this.notes)
                .receipt(this.receipt != null ? this.receipt : true)
                .build();

        if(nonNull(this.serviceDiscounts)){
            List<VisitDiscount> serviceDiscounts = this.serviceDiscounts.stream()
                    .map(VisitDiscountDTO::toEntity)
                    .collect(Collectors.toList());
            visit.setServiceDiscounts(serviceDiscounts);
        }
        if(nonNull(this.items)) {
            List<VisitItem> items = this.items.stream()
                    .map(VisitItemDTO::toEntity)
                    .collect(Collectors.toList());
            visit.setItems(items);
        }
        if(nonNull(this.debtRedemptions)) {
            List<DebtRedemption> debtRedemptions = this.debtRedemptions.stream()
                    .map(DebtRedemptionDTO::toEntity)
                    .collect(Collectors.toList());
            visit.setDebtRedemptions(debtRedemptions);
        }
        if(nonNull(this.payments)) {
            List<Payment> payments = this.payments.stream()
                    .map(PaymentDTO::toEntity)
                    .collect(Collectors.toList());
            visit.setPayments(payments);
        }

        return visit;
    }
}
