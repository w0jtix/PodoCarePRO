package com.podocare.PodoCareWebsite.DTO.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientFilterDTO {
    private String keyword;
    private Boolean boostClient;
    private Boolean signedRegulations;
    private Boolean hasDebts;
    private Long discountId;
}
