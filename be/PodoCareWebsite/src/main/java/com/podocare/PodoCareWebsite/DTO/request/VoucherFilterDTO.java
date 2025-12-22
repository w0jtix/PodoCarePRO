package com.podocare.PodoCareWebsite.DTO.request;

import com.podocare.PodoCareWebsite.model.constants.VoucherStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoucherFilterDTO {
    private VoucherStatus status;
    private String keyword;
}
