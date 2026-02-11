package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.VoucherDTO;
import com.podocare.PodoCareWebsite.DTO.request.VoucherFilterDTO;

import java.util.List;

public interface VoucherService {

    VoucherDTO getVoucherById(Long id);

    List<VoucherDTO> getVouchers(VoucherFilterDTO filter);

    VoucherDTO createVoucher(VoucherDTO voucher);

    VoucherDTO updateVoucher(Long id, VoucherDTO voucher);

    void deleteVoucherById(Long id);

    Boolean hasSaleReference(Long voucherId);
}
