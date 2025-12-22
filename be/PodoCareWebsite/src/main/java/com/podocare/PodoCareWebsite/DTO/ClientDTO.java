package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Boolean signedRegulations;
    private Boolean boostClient;
    private Boolean redFlag;
    private DiscountDTO discount;
    private Boolean isDeleted;
    private Boolean hasDebts;
    private Long visitsCount;
    private Boolean hasActiveVoucher;
    private Boolean hasBooksyReview;
    private Boolean hasGoogleReview;
    private Boolean hasActiveGoogleReview;

    public ClientDTO(Client client) {
        this.id = client.getId();
        this.firstName = client.getFirstName();
        this.lastName = client.getLastName();
        this.phoneNumber = client.getPhoneNumber();
        this.signedRegulations = client.getSignedRegulations();
        this.boostClient = client.getBoostClient();
        this.redFlag = client.getRedFlag();
        this.discount = client.getDiscount() != null ? new DiscountDTO(client.getDiscount()) : null;
        this.isDeleted = client.getIsDeleted();
    }
    public ClientDTO(Client client,
                     Boolean hasDebts,
                     Long visitsCount,
                     Boolean hasActiveVoucher,
                     Boolean hasBooksyReview,
                     Boolean hasGoogleReview,
                     Boolean hasActiveGoogleReview) {
        this.id = client.getId();
        this.firstName = client.getFirstName();
        this.lastName = client.getLastName();
        this.phoneNumber = client.getPhoneNumber();
        this.signedRegulations = client.getSignedRegulations();
        this.boostClient = client.getBoostClient();
        this.redFlag = client.getRedFlag();
        this.discount = client.getDiscount() != null ? new DiscountDTO(client.getDiscount()) : null;
        this.isDeleted = client.getIsDeleted();
        this.hasDebts = hasDebts;
        this.visitsCount = visitsCount;
        this.hasActiveVoucher = hasActiveVoucher;
        this.hasBooksyReview = hasBooksyReview;
        this.hasGoogleReview = hasGoogleReview;
        this.hasActiveGoogleReview = hasActiveGoogleReview;
    }

    public Client toEntity() {
        return Client.builder()
                .id(this.id)
                .firstName(this.firstName)
                .lastName(this.lastName)
                .phoneNumber(this.phoneNumber)
                .signedRegulations(this.signedRegulations)
                .boostClient(this.boostClient)
                .redFlag(this.redFlag != null ? this.redFlag : false)
                .discount(this.discount != null ? this.discount.toEntity() : null)
                .isDeleted(this.isDeleted != null ? this.isDeleted : false)
                .build();
    }

}
